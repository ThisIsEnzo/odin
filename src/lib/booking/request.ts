import { z } from "zod";
import { experiences } from "@/data/odin/experiences";
import { siteConfig } from "@/data/odin/site";
import type { BookingActivitySelection, BookingEstimate, BookingRequestDraft, Experience } from "@/types/domain";
import { isValidTimeFormat, maxBookingDate, thailandToday } from "./rules";

/** Technical payload limit; not an asserted business capacity. */
export const MAX_REQUEST_GUESTS = 200;
export function unitBounds(guestCount: number, maxGuestsPerUnit: number) {
  return { min: Math.ceil(guestCount / maxGuestsPerUnit), max: guestCount };
}
export function createSelection(activity: Experience): BookingActivitySelection {
  return { activityId: activity.id, guestCount: 1,
    ...(activity.booking?.model === "capacity_unit" ? { unitCount: 1 } : {}),
    ...(activity.durationOptions?.length === 1 ? { durationMinutes: activity.durationOptions[0]!.durationMinutes } : {}) };
}
/** Keep a chosen unit count when possible; clamp only when guests make it invalid. */
export function withGuestCount(selection: BookingActivitySelection, guestCount: number, activity: Experience) {
  if (activity.booking?.model !== "capacity_unit") return { ...selection, guestCount };
  const bounds = unitBounds(guestCount, activity.booking.maxGuestsPerUnit);
  return { ...selection, guestCount, unitCount: Math.min(bounds.max, Math.max(bounds.min, selection.unitCount ?? bounds.min)) };
}

export function createBookingRequestSchema(catalog: Experience[] = experiences, now = () => new Date()) {
  return z.object({
    schemaVersion: z.literal(3),
    visitDate: z.string().refine(date => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const value = Date.parse(date), clock = now();
      return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date &&
        date >= thailandToday(clock) && date <= maxBookingDate(clock) &&
        !siteConfig.blackoutDates?.includes(date) && !siteConfig.closedWeekdays?.includes(new Date(value).getUTCDay());
    }, "invalidDate"),
    // A preference, not an activity slot: no interval, closing-duration or sequencing rules.
    preferredStartTime: z.string().refine(isValidTimeFormat, "invalidTimeFormat"),
    customer: z.object({
      fullName: z.string().trim().min(1, "nameRequired").max(120, "nameRequired"),
      email: z.string().trim().email("invalidEmail").max(254, "invalidEmail"),
      phone: z.string().trim().min(6, "invalidPhone").max(30, "invalidPhone")
        .refine(value => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 6, "invalidPhone"),
    }),
    activities: z.array(z.object({
      activityId: z.string().min(1, "invalidExperience").max(100, "invalidExperience"),
      guestCount: z.number().int("invalidGuestCount").min(1, "invalidGuestCount").max(MAX_REQUEST_GUESTS, "requestTooLarge"),
      durationMinutes: z.number().int("invalidDuration").positive("invalidDuration").optional(),
      unitCount: z.number().int("invalidUnitCount").positive("invalidUnitCount").max(MAX_REQUEST_GUESTS, "invalidUnitCount").optional(),
    })).min(1, "chooseExperience").max(50, "requestTooLarge").superRefine((selections, ctx) => {
      const seen = new Set<string>();
      selections.forEach((selection, index) => {
        const add = (field: string, message: string) => ctx.addIssue({code: "custom", path: [index, field], message});
        const activity = catalog.find(e => e.id === selection.activityId && e.booking);
        if (!activity) { add("activityId", "invalidExperience"); return; }
        if (seen.has(activity.id)) add("activityId", "duplicateActivity");
        seen.add(activity.id);
        const tiers = activity.durationOptions ?? [];
        if ((tiers.length || selection.durationMinutes !== undefined) && !tiers.some(t =>
          Number.isInteger(t.durationMinutes) && t.durationMinutes > 0 && t.durationMinutes === selection.durationMinutes)) add("durationMinutes", "invalidDuration");
        if (activity.booking!.model === "capacity_unit") {
          const capacity = activity.booking!;
          if (!Number.isInteger(capacity.maxGuestsPerUnit) || capacity.maxGuestsPerUnit < 1) { add("unitCount", "invalidUnitCount"); return; }
          const {min, max} = unitBounds(selection.guestCount, capacity.maxGuestsPerUnit);
          if (selection.unitCount === undefined || selection.unitCount < min || selection.unitCount > max) add("unitCount", "invalidUnitCount");
        } else if (selection.unitCount !== undefined) add("unitCount", "unexpectedUnitCount");
      });
    }),
    notes: z.string().trim().max(500, "notesTooLong").optional(),
    locale: z.enum(["en", "ru", "th", "zh"]),
    company: z.string().max(0, "invalidSubmission").optional(),
  });
}
export const bookingRequestSchema = createBookingRequestSchema();

/** Estimate inputs come only from the approved catalog, never legacy mock prices. */
export function calculateRequestEstimate(draft: Pick<BookingRequestDraft, "activities">, catalog: Experience[] = experiences): BookingEstimate {
  const items = draft.activities.map(selection => {
    const pending = { itemId: selection.activityId, amount: null, ...(selection.durationMinutes === undefined ? {} : {durationMinutes: selection.durationMinutes}) };
    const activity = catalog.find(e => e.id === selection.activityId && e.booking);
    const tier = activity?.durationOptions?.find(t => t.durationMinutes === selection.durationMinutes);
    if (!tier || tier.price.currency !== "THB" || !Number.isFinite(tier.price.amount) || tier.price.amount < 0 || selection.guestCount < 1) return pending;
    const quantity = tier.quantityBasis === "participant" ? selection.guestCount : tier.quantityBasis === "booking" ? 1 : tier.quantityBasis === "unit" && activity?.booking?.model === "capacity_unit" ? selection.unitCount : undefined;
    if (!Number.isInteger(quantity) || quantity! < 1) return pending;
    return {...pending, amount: Math.round(tier.price.amount * 100) * quantity! / 100, quantity, unitAmount: tier.price.amount, unit: tier.price.unit};
  });
  return {version: 1, currency: "THB", items, amount: items.length && items.every(item => item.amount !== null) ? items.reduce((sum, item) => sum + Math.round(item.amount! * 100), 0) / 100 : null};
}
