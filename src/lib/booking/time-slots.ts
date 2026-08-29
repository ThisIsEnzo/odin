import type { Experience } from "@/types/domain";
import { MAX_BOOKING_WINDOW_DAYS } from "@/lib/validation/booking.schema";

/**
 * Derives the list of valid start times for an experience directly from its
 * canonical operatingHours + bookingIntervalMinutes — the same facts layer
 * BOOKING_RULES.md §4's schema validates against. No numbers are hardcoded
 * here; changing an experience's hours or interval in
 * src/data/odin/experiences.ts is the only thing that changes this output.
 *
 * Boundary semantics (unchanged from Phase 2/4A): opening time is inclusive,
 * closing time is exclusive — e.g. Horse Riding 07:00–18:00 offers 07:00 but
 * never 18:00.
 */
export function getAvailableTimeSlots(experience: Experience): string[] {
  const [openH, openM] = experience.operatingHours.open.split(":").map(Number);
  const [closeH, closeM] = experience.operatingHours.close.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const interval = experience.bookingIntervalMinutes;

  const slots: string[] = [];
  for (let t = openMinutes; t < closeMinutes; t += interval) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}

/** Today's date as "YYYY-MM-DD" in the visitor's local time — used only to
 * disable obviously-past dates on the client; the server independently
 * re-derives and enforces this via booking.schema.ts. */
export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function maxIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_BOOKING_WINDOW_DAYS);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
