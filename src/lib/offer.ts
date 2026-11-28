import type { Experience, Money, Package, OperatingHours } from "@/types/domain";

/** Return a price only when its canonical provenance flag says it is confirmed. */
export function offerPrice(
  experience?: Experience,
  pack?: Package,
): Money | null {
  if (experience) {
    if (experience.mock.price.isMock) return null;
    const lowestTier = [...(experience.durationOptions ?? [])].sort(
      (a, b) => a.price.amount - b.price.amount,
    )[0];
    return lowestTier?.price ?? experience.price ?? null;
  }

  if (!pack || pack.mock.isMock) return null;
  return pack.price;
}

/** Hours are public only after explicit confirmation in canonical data. */
export function confirmedHours(experience?: Experience): OperatingHours | null {
  return experience?.hoursConfirmed === true ? experience.operatingHours : null;
}

/** Approved duration options only; a slot interval is never a duration. */
export function durationLabel(experience: Experience): number[] {
  return [...new Set((experience.durationOptions ?? []).map((option) => option.durationMinutes))]
    .sort((a, b) => a - b);
}
