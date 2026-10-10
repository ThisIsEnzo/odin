"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Experience, Package } from "@/types/domain";

/** Display confirmed catalog facts; slot cadence and mock prices are never offers. */
export function OfferFacts({ experience, pack }: { experience?: Experience; pack?: Package }) {
  const t = useTranslations("booking.pricing");
  const format = useFormatter();
  const tiers = experience?.durationOptions ?? [];
  const lowestTier = [...tiers].sort((a, b) => a.price.amount - b.price.amount)[0];
  const price = lowestTier?.price ?? (experience && !experience.mock.price.isMock ? experience.price : pack && !pack.mock.isMock ? pack.price : null);
  const durations = [...new Set(tiers.map(tier => tier.durationMinutes))].sort((a, b) => a - b);
  return <dl className="offer-facts">
    {experience && <div><dt>{t("duration")}</dt><dd>{durations.length ? durations.map(count => t("minutes", { count })).join(" / ") : experience.durationMinutes ? t("minutes", { count: experience.durationMinutes }) : t("pending")}</dd></div>}
    <div><dt>{t("price")}</dt><dd>{price ? <>{t("from", { amount: format.number(price.amount, { style: "currency", currency: "THB", maximumFractionDigits: 2 }) })}<small>{t(`unit.${price.unit}`)}</small></> : t("pending")}</dd></div>
  </dl>;
}
