import { z } from "zod";
import { experiences } from "@/data/odin/experiences";
import type { ExperienceId } from "@/types/domain";

/**
 * Single canonical booking validation schema — built from
 * src/data/odin/experiences.ts, never from hardcoded numbers — used both
 * for client-side instant feedback (zodResolver) and as the real
 * server-side security boundary (see app/api/booking/route.ts).
 * BOOKING_RULES.md §4.
 *
 * IMPORTANT: this covers EXPERIENCE bookings only (type: "experience").
 * Neither BOOKING_RULES.md nor DATA_MODEL.md specify package-booking
 * validation rules (packages have no operatingHours/weight-restriction
 * shape of their own), so package booking validation is left unbuilt here
 * rather than invented — flagged for Phase 4B / business input.
 */

// Engineering default, not specified in the brief — flagged explicitly per
// BOOKING_RULES.md §3 ("proposed default: 90 days out... not specified in
// the brief") and MOCK_DATA.md §5. Confirm with ODIN before launch.
const MAX_BOOKING_WINDOW_DAYS = 90;

const experienceMap = Object.fromEntries(experiences.map((e) => [e.id, e]));
const experienceIds = experiences.map((e) => e.id) as [ExperienceId, ...ExperienceId[]];

function toUtcDayNumber(isoDate: string): number | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  // Rejects invalid calendar dates like "2026-02-30" that z.string().date()
  // alone would let ambiguously roll over.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date.getTime();
}

export const bookingSchema = z
  .object({
    experienceId: z.enum(experienceIds),
    date: z.string().date(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
    guests: z.number().int().min(1), // upper bound: unbounded pending business input, BOOKING_RULES.md §3
    weightKg: z.number().positive().optional(),
    customer: z.object({
      name: z.string().min(1).max(120),
      email: z.string().email(),
      phone: z.string().min(6).max(30),
      notes: z.string().max(500).optional(),
    }),
    locale: z.enum(["en", "th", "ru", "zh"]),
    // Honeypot field (BOOKING_RULES.md §6) — invisible to real users in the
    // future BookingForm; must always arrive empty.
    company: z.string().max(0, "Invalid submission").optional(),
  })
  .superRefine((data, ctx) => {
    const experience = experienceMap[data.experienceId];
    if (!experience) {
      ctx.addIssue({ code: "custom", path: ["experienceId"], message: "Unknown experience" });
      return;
    }

    const requestedDay = toUtcDayNumber(data.date);
    if (requestedDay === null) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Invalid calendar date" });
    } else {
      const now = new Date();
      const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const maxDay = todayDay + MAX_BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

      if (requestedDay < todayDay) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "Date cannot be in the past" });
      } else if (requestedDay > maxDay) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: `Date must be within ${MAX_BOOKING_WINDOW_DAYS} days`,
        });
      }
    }

    // Operating hours — re-derived from the facts layer, never trusted from the client.
    if (data.time < experience.operatingHours.open || data.time >= experience.operatingHours.close) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Outside operating hours" });
    }

    // Booking-interval alignment — BOOKING_RULES.md §3's field table requires
    // this ("aligned to its bookingIntervalMinutes"), but the §4 sample
    // schema in that same doc omits it. Added here to actually satisfy §3,
    // not left out to match the incomplete example literally.
    const [hh, mm] = data.time.split(":").map(Number);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      const totalMinutes = hh * 60 + mm;
      if (totalMinutes % experience.bookingIntervalMinutes !== 0) {
        ctx.addIssue({
          code: "custom",
          path: ["time"],
          message: "Time must align to the booking interval",
        });
      }
    }

    // Conditional weight requirement — driven by data, not an
    // "if experience === 'horse'" branch. BOOKING_RULES.md §5.
    if (experience.requiresWeight && data.weightKg === undefined) {
      ctx.addIssue({ code: "custom", path: ["weightKg"], message: "Weight is required" });
    }
    const maxWeight = experience.restrictions.maxWeightKg;
    if (maxWeight !== undefined && data.weightKg !== undefined && data.weightKg > maxWeight) {
      ctx.addIssue({
        code: "custom",
        path: ["weightKg"],
        message: `Maximum weight is ${maxWeight}kg`,
      });
    }
    const minWeight = experience.restrictions.minWeightKg;
    if (minWeight !== undefined && data.weightKg !== undefined && data.weightKg < minWeight) {
      ctx.addIssue({
        code: "custom",
        path: ["weightKg"],
        message: `Minimum weight is ${minWeight}kg`,
      });
    }

    if (data.company && data.company.length > 0) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "Invalid submission" });
    }
  });

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingValidated = z.output<typeof bookingSchema>;
