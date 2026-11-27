import type { Experience, Money, Package } from "@/types/domain";

/** Return a price only when its canonical provenance flag says it is confirmed. */
export function selectOfferPrice(
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
