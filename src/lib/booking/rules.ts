/**
 * Booking business rules — pure functions, no React, no framework coupling.
 * Reads exclusively from domain data (Experience.operatingHours,
 * Experience.restrictions) — never hardcodes a number or a
 * `if (experienceId === 'horse-riding')` branch. See CLAUDE.md §7/§9 and
 * /docs/BOOKING_RULES.md §2–4.
 *
 * These are the functions both sides of the client/server boundary will call
 * once the booking flow exists (Phase 4): client-side for instant UX
 * feedback, server-side inside the API route as the actual security
 * boundary. The server must re-run these against data it controls — never
 * trust a client-submitted time/weight/hours combination at face value.
 */

import type { Experience, OperatingHours, BookingItem, Package, BookingOption, BookingOptionSelection, BookingCustomer, SiteConfig } from "@/types/domain";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ValidationIssueCode =
  | "INVALID_EXPERIENCE"
  | "INVALID_TIME_FORMAT"
  | "OUTSIDE_OPERATING_HOURS"
  | "WEIGHT_REQUIRED"
  | "WEIGHT_EXCEEDS_MAXIMUM"
  | "WEIGHT_BELOW_MINIMUM"
  | "INVALID_GUEST_COUNT"
  | "INVALID_DATE";

/**
 * `messageKey` points into messages/{locale}.json under `booking.errors.*`
 * — never a raw display string. The UI layer resolves it via
 * useTranslations(); this module has no knowledge of language. `meta`
 * carries interpolation values (e.g. the actual max weight) for that
 * translated message.
 */
export interface ValidationIssue {
  field: "experienceId" | "date" | "time" | "guests" | "weightKg";
  code: ValidationIssueCode;
  messageKey: string;
  meta?: Record<string, string | number>;
}

export type ValidationResult = { valid: true } | { valid: false; issues: ValidationIssue[] };

// ---------------------------------------------------------------------------
// Operating hours
// ---------------------------------------------------------------------------

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimeFormat(time: string): boolean {
  return TIME_PATTERN.test(time);
}

/**
 * Boundary semantics — deliberately chosen and documented, per CLAUDE.md's
 * instruction to pick a sensible rule and apply it consistently. See
 * /docs/BOOKING_RULES.md §2a for the same decision recorded in the docs.
 *
 *   `open`  is INCLUSIVE — the first bookable start time.
 *   `close` is EXCLUSIVE — never itself a valid start time.
 *
 * Rationale: operating hours describe when the business is open, not an
 * abstract numeric range. A guest starting a fresh session at the exact
 * moment an experience closes would necessarily run past closing — that's
 * unrealistic and undesirable for a staffed physical activity (horse
 * riding, ATV). Treating `close` as exclusive means "18:00" is never a
 * valid start time for an experience that closes at 18:00; the practical
 * last bookable slot is whatever the experience's own
 * `bookingIntervalMinutes` grid produces before that boundary (e.g. 17:00
 * for horse-riding's 60-minute interval).
 *
 * This function checks only the boundary, not interval alignment — a time
 * that falls within hours but doesn't land on the configured interval grid
 * is a UI-level slot-picker concern, not something this function judges.
 */
export function isTimeWithinOperatingHours(time: string, hours: OperatingHours): boolean {
  return time >= hours.open && time < hours.close;
}

// ---------------------------------------------------------------------------
// Restrictions
// ---------------------------------------------------------------------------

/**
 * Validates the restriction fields the current booking flow actually
 * collects. Today that's weight only (CLAUDE.md §11 — required for
 * horse-riding and pony-riding, nothing else). `ExperienceRestrictions`
 * also carries `minAge`/`maxAge`, but the booking flow has no age or
 * birthdate input to validate against — age restrictions are informational,
 * shown on the experience page so guests can self-screen before booking.
 * If a future phase adds an age/birthdate field to the booking form, extend
 * this function rather than adding a parallel one — that's the point of
 * keeping restriction checks in one place.
 */
export function validateExperienceRestrictions(
  weightKg: number | undefined,
  experience: Experience,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { requiresWeight, restrictions } = experience;

  if (requiresWeight && weightKg === undefined) {
    issues.push({
      field: "weightKg",
      code: "WEIGHT_REQUIRED",
      messageKey: "booking.errors.weightRequired",
    });
    return issues; // nothing further to check without a value
  }

  if (weightKg === undefined) {
    return issues; // not required for this experience, and none was given — fine
  }

  if (restrictions.maxWeightKg !== undefined && weightKg > restrictions.maxWeightKg) {
    issues.push({
      field: "weightKg",
      code: "WEIGHT_EXCEEDS_MAXIMUM",
      messageKey: "booking.errors.weightExceedsMaximum",
      meta: { max: restrictions.maxWeightKg },
    });
  }

  if (restrictions.minWeightKg !== undefined && weightKg < restrictions.minWeightKg) {
    issues.push({
      field: "weightKg",
      code: "WEIGHT_BELOW_MINIMUM",
      messageKey: "booking.errors.weightBelowMinimum",
      meta: { min: restrictions.minWeightKg },
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Top-level orchestrator
// ---------------------------------------------------------------------------

export interface BookingValidationInput {
  experienceId: string;
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  /** 24h "HH:mm" */
  time: string;
  guests: number;
  weightKg?: number;
}

/**
 * Deliberately conservative for this foundation phase: well-formed ISO
 * date, not in the past, relative to server-local "today". ODIN operates
 * on Thailand time (ICT, UTC+7); if this is ever deployed with a server
 * clock in a different timezone, a booking made late at night could land on
 * the wrong side of the boundary. Worth a proper timezone-aware check
 * before this gates a real API route in Phase 4 — flagged rather than
 * silently treated as exact.
 */
function isValidFutureDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return date >= today;
}

/**
 * The single validation entry point for a booking request. Composes the
 * functions above; this is what both the (future) client-side form
 * resolver and the (future) API route call — see /docs/BOOKING_RULES.md §4.
 *
 * `experiences` is passed in rather than imported internally, so this stays
 * a pure function: easy to unit test with fixture data, and it doesn't hide
 * a dependency on the real data module inside business logic.
 */
export function validateBookingRequest(
  input: BookingValidationInput,
  experiences: Experience[],
): ValidationResult {
  const experience = experiences.find((candidate) => candidate.id === input.experienceId);

  if (!experience) {
    return {
      valid: false,
      issues: [
        {
          field: "experienceId",
          code: "INVALID_EXPERIENCE",
          messageKey: "booking.errors.invalidExperience",
        },
      ],
    };
  }

  const issues: ValidationIssue[] = [];

  if (!isValidTimeFormat(input.time)) {
    issues.push({
      field: "time",
      code: "INVALID_TIME_FORMAT",
      messageKey: "booking.errors.invalidTimeFormat",
    });
  } else if (!isTimeWithinOperatingHours(input.time, experience.operatingHours)) {
    issues.push({
      field: "time",
      code: "OUTSIDE_OPERATING_HOURS",
      messageKey: "booking.errors.outsideOperatingHours",
      meta: { open: experience.operatingHours.open, close: experience.operatingHours.close },
    });
  }

  if (!Number.isInteger(input.guests) || input.guests < 1) {
    issues.push({
      field: "guests",
      code: "INVALID_GUEST_COUNT",
      messageKey: "booking.errors.invalidGuestCount",
    });
  }

  if (!isValidFutureDate(input.date)) {
    issues.push({
      field: "date",
      code: "INVALID_DATE",
      messageKey: "booking.errors.invalidDate",
    });
  }

  issues.push(...validateExperienceRestrictions(input.weightKg, experience));

  return issues.length === 0 ? { valid: true } : { valid: false, issues };
}


// Booking V2 is the active validation entry point. V1 above remains a pure
// compatibility helper for existing primitive rule consumers/tests.
export const MAX_BOOKING_WINDOW_DAYS = 90; // Existing engineering default, not a capacity claim.
export function thailandToday(now = new Date()): string {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function maxBookingDate(now = new Date()): string {
  return new Date(Date.parse(thailandToday(now)) + MAX_BOOKING_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
}
export function availableTimeSlots(experience: Experience): string[] {
  const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const interval = experience.bookingIntervalMinutes;
  if (!Number.isFinite(interval) || interval <= 0) return [];
  const slots: string[] = [];
  for (let m = minutes(experience.operatingHours.open); m < minutes(experience.operatingHours.close); m += interval) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}
export interface VisitIssue { path: (string | number)[]; key: string; params?: Record<string, string | number> }
export function availableContactChannels(site: SiteConfig) {
  return (["phone", "email", "line", "whatsapp"] as const).filter(key => !site[key].isMock && !!site[key].value);
}
export function validateContactPreference(customer: BookingCustomer, site: SiteConfig): VisitIssue[] {
  if (!customer.preferredChannel) return [];
  if (!availableContactChannels(site).includes(customer.preferredChannel)) return [{path:["customer", "preferredChannel"], key:"invalidContactChannel"}];
  if (["line", "whatsapp"].includes(customer.preferredChannel) && !customer.channelIdentity?.trim()) return [{path:["customer", "channelIdentity"], key:"contactIdentityRequired"}];
  return [];
}
export function validateVisit(items: BookingItem[], catalog: Experience[], packageCatalog: Package[], options: BookingOption[] = [], now = new Date()): VisitIssue[] {
  const issues: VisitIssue[] = [];
  const add = (path: (string|number)[], key: string, params?: Record<string,string|number>) => issues.push({path,key,params});
  if (!items.length) add(["items"], "emptyVisit");
  const ids = new Set<string>();
  function checkId(id: string, path: (string|number)[]) {
    if (ids.has(id)) add([...path,"id"], "duplicateId");
    ids.add(id);
  }
  function checkOptions(selections: BookingOptionSelection[], target: {experienceId?: string; packageId?: string}, path: (string|number)[]) {
    const seen = new Set<string>();
    selections.forEach((selected, i) => {
      const option = options.find(o => o.id === selected.optionId);
      const applies = option && (target.experienceId ? option.applicableTo.experienceIds?.some(id => id === target.experienceId) : option.applicableTo.packageIds?.includes(target.packageId!));
      if (!applies || seen.has(selected.optionId) || !Number.isInteger(selected.quantity) || selected.quantity < option!.constraints.minQuantity || selected.quantity > option!.constraints.maxQuantity) add([...path,i], "invalidOption");
      seen.add(selected.optionId);
    });
  }
  function activity(a: import("@/types/domain").ActivityBookingItem, path: (string|number)[]) {
    checkId(a.id,path);
    const exp = catalog.find(e => e.id === a.experienceId);
    if (!exp) { add([...path,"experienceId"], "invalidExperience"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date) || !Number.isFinite(Date.parse(a.date)) || new Date(a.date).toISOString().slice(0,10) !== a.date || a.date < thailandToday(now) || a.date > maxBookingDate(now)) add([...path,"date"], "invalidDate");
    if (!isValidTimeFormat(a.time)) add([...path,"time"], "invalidTimeFormat");
    else if (!isTimeWithinOperatingHours(a.time, exp.operatingHours)) add([...path,"time"], "outsideOperatingHours", exp.operatingHours);
    else if (!availableTimeSlots(exp).includes(a.time)) add([...path,"time"], "invalidTimeInterval");
    if (!a.participants.length) add([...path,"participants"], "invalidGuestCount");
    a.participants.forEach((p,i) => {
      checkId(p.id,[...path,"participants",i]);
      if (!exp.requiresWeight && p.weightKg !== undefined) add([...path,"participants",i,"weightKg"], "unexpectedWeight");
      if (exp.requiresWeight) {
        if (p.weightKg !== undefined && (!Number.isFinite(p.weightKg) || p.weightKg <= 0)) add([...path,"participants",i,"weightKg"], "weightRequired");
        else for (const issue of validateExperienceRestrictions(p.weightKg,exp)) add([...path,"participants",i,"weightKg"],issue.messageKey.replace("booking.errors.",""),issue.meta);
      }
    });
    checkOptions(a.options, {experienceId:a.experienceId}, [...path,"options"]);
  }
  items.forEach((item,i) => {
    const path = ["items",i];
    if (item.type === "activity") activity(item,path);
    else {
      checkId(item.id,path);
      const pack = packageCatalog.find(p => p.id === item.packageId);
      if (!pack) add([...path,"packageId"],"invalidPackage");
      else if (item.components.length !== pack.includedExperienceIds.length || [...item.components.map(c => c.experienceId)].sort().join() !== [...pack.includedExperienceIds].sort().join()) add([...path,"components"],"invalidPackageComponents");
      item.components.forEach((a,j) => activity(a,[...path,"components",j]));
      checkOptions(item.options,{packageId:item.packageId},[...path,"options"]);
    }
  });
  return issues;
}
