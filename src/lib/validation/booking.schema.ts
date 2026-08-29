import { z } from "zod";
import { experiences } from "@/data/odin/experiences";
import { validateBookingRequest } from "@/lib/booking/rules";
import type { ExperienceId } from "@/types/domain";

/**
 * CONSOLIDATION FIX (Phase 4 recovery): this schema previously re-derived
 * operating-hours/weight/date/guest-count business logic independently
 * inside its own superRefine. Once the real src/lib/booking/rules.ts (with
 * its own tests/unit/booking-rules.test.ts) was brought into the same tree,
 * that turned out to be a genuine duplicate implementation of the exact
 * same rules — precisely what CLAUDE.md/BOOKING_RULES.md's "one canonical
 * source" architecture and the original Phase 4A brief ("do NOT duplicate
 * rules in... validation schemas") both rule out. Fixed here by having Zod
 * own only SHAPE validation (types, string formats, field lengths,
 * honeypot) and delegating every actual business-rule check to
 * validateBookingRequest() from rules.ts — the same function
 * booking-rules_test.ts already covers. No thresholds or dates changed.
 *
 * Scope note: this schema still covers `type: "experience"` bookings only.
 * Neither BOOKING_RULES.md nor DATA_MODEL.md define validation rules for a
 * `type: "package"` request — left unbuilt rather than invented, as flagged
 * in Phase 4A/4B.
 */

// Engineering default, not specified in the brief — flagged explicitly per
// BOOKING_RULES.md §3 ("proposed default: 90 days out... not specified in
// the brief") and MOCK_DATA.md §5. Confirm with ODIN before launch. NOT
// present in rules.ts (which only rejects past dates, not a future window),
// so this is additive, not a duplicate of anything there.
export const MAX_BOOKING_WINDOW_DAYS = 90;

const experienceIds = experiences.map((e) => e.id) as [ExperienceId, ...ExperienceId[]];

function toUtcDayNumber(isoDate: string): number | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date.getTime();
}

const baseSchema = z.object({
  experienceId: z.enum(experienceIds, { message: "invalidExperience" }),
  // z.string().date() already rejects non-calendar dates (e.g. "2026-02-30")
  // at the shape level, before rules.ts's own past-date business check ever
  // runs — the two are complementary, not overlapping.
  date: z.string().date("invalidDate"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "invalidTimeFormat"),
  // Deliberately no .min(1) here — rules.ts's INVALID_GUEST_COUNT check owns
  // that business message; Zod only guarantees "this is an integer."
  guests: z.number().int("invalidGuestCount"),
  weightKg: z.number().positive().optional(),
  customer: z.object({
    name: z.string().min(1, "nameRequired").max(120, "nameRequired"),
    email: z.string().email("invalidEmail"),
    phone: z.string().min(6, "invalidPhone").max(30, "invalidPhone"),
    notes: z.string().max(500).optional(),
  }),
  locale: z.enum(["en", "th", "ru", "zh"]),
  // Honeypot field (BOOKING_RULES.md §6) — invisible to real users; must
  // always arrive empty. Anti-spam, not a business rule, so genuinely
  // outside rules.ts's scope.
  company: z.string().max(0, "invalidSubmission").optional(),
});

export const bookingSchema = baseSchema.superRefine((data, ctx) => {
  // The actual business rules — experience existence, time format,
  // operating hours, conditional weight requirement/min/max, guest count,
  // past-date rejection — all come from rules.ts's validateBookingRequest,
  // not from logic re-derived here.
  const result = validateBookingRequest(
    {
      experienceId: data.experienceId,
      date: data.date,
      time: data.time,
      guests: data.guests,
      weightKg: data.weightKg,
    },
    experiences,
  );

  if (!result.valid) {
    for (const issue of result.issues) {
      // rules.ts's messageKey is fully-qualified ("booking.errors.xyz");
      // this schema (and the UI built against it) uses the short form, so
      // strip the shared prefix rather than keeping two conventions.
      const shortKey = issue.messageKey.replace(/^booking\.errors\./, "");
      ctx.addIssue({ code: "custom", path: [issue.field], message: shortKey, params: issue.meta });
    }
  }

  const experience = experiences.find((e) => e.id === data.experienceId);

  // Additive, defense-in-depth checks NOT covered by rules.ts — flagged
  // explicitly because they extend beyond that module's documented scope,
  // rather than silently overriding it:

  // 1) Booking-interval alignment. rules.ts's own doc comment on
  //    isTimeWithinOperatingHours explicitly scopes this OUT: "a time that
  //    falls within hours but doesn't land on the configured interval grid
  //    is a UI-level slot-picker concern, not something this function
  //    judges." Kept here as server-side defense-in-depth against a
  //    hand-crafted request bypassing the UI's slot picker (ARCHITECTURE.md
  //    §7 — never trust client-submitted values) — worth the team
  //    confirming this is wanted, since rules.ts's author deliberately left
  //    it out.
  if (experience && /^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) {
    const [hh, mm] = data.time.split(":").map(Number);
    const totalMinutes = hh * 60 + mm;
    if (totalMinutes % experience.bookingIntervalMinutes !== 0) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "invalidTimeInterval" });
    }
  }

  // 2) Maximum booking window — rules.ts only rejects PAST dates; this adds
  //    BOOKING_RULES.md §3's separately-proposed 90-day cap, which isn't in
  //    rules.ts at all (not a duplicate of anything there).
  const requestedDay = toUtcDayNumber(data.date);
  if (requestedDay !== null) {
    const now = new Date();
    const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const maxDay = todayDay + MAX_BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (requestedDay > maxDay) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "invalidDate",
        params: { maxDays: MAX_BOOKING_WINDOW_DAYS },
      });
    }
  }

  if (data.company && data.company.length > 0) {
    ctx.addIssue({ code: "custom", path: ["company"], message: "invalidSubmission" });
  }
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingValidated = z.output<typeof bookingSchema>;

export type FieldErrorEntry = { key: string; params?: Record<string, unknown> };

/**
 * Flattens Zod issues into a { "path.to.field": { key, params } } map so the
 * UI can resolve each one via useTranslations('booking.errors') without any
 * duplicate rule logic.
 */
export function collectFieldErrors(
  issues: { path: (string | number)[]; message: string; params?: Record<string, unknown> }[],
): Record<string, FieldErrorEntry> {
  const out: Record<string, FieldErrorEntry> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!out[path]) {
      out[path] = { key: issue.message, params: issue.params };
    }
  }
  return out;
}
