"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Experience, Package } from "@/types/domain";
import { selectOfferPrice } from "@/lib/offer-price";

/** Display confirmed catalog facts; slot cadence and mock prices are never offers. */
export function OfferFacts({ experience, pack }: { experience?: Experience; pack?: Package }) {
  const t = useTranslations("booking.pricing");
  const format = useFormatter();
  const tiers = experience?.durationOptions ?? [];
  const price = selectOfferPrice(experience, pack);
  const durations = [...new Set(tiers.map(tier => tier.durationMinutes))].sort((a, b) => a - b);
  return <dl className="offer-facts">
    {experience && <div><dt>{t("duration")}</dt><dd>{durations.length ? durations.map(count => t("minutes", { count })).join(" / ") : experience.durationMinutes ? t("minutes", { count: experience.durationMinutes }) : t("pending")}</dd></div>}
    <div className={`offer-price ${price ? "is-known" : "is-pending"}`}><dt>{t(price ? "startsFrom" : "price")}</dt><dd>{price ? <><span className="offer-price-value">{format.number(price.amount, { style: "currency", currency: "THB", maximumFractionDigits: 2 })}</span><small>{t(`unit.${price.unit}`)}</small></> : <span className="offer-price-value">{t("pending")}</span>}</dd></div>
  </dl>;
}
