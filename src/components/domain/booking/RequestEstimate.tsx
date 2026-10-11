"use client";
import {useTranslations} from "next-intl";
import type {Locale} from "@/types/domain";
import type {PromotionSnapshot} from "@/lib/booking/promotions";
import {RequestPromotions} from "./RequestPromotions";

/** Presentation only: all amounts and offer statuses come from the canonical preview. */
export function RequestEstimate({amount, snapshot, locale, money, review=false}: {
  amount: number | null; snapshot?: PromotionSnapshot; locale: Locale;
  money: (value: number | null) => string; review?: boolean;
}) {
  const p=useTranslations("booking.pricing"), t=useTranslations("booking.promotions");
  return <div className="request-estimate">
    <dl className="request-subtotal"><div><dt>{t("subtotal")}</dt><dd>{money(snapshot?.subtotalAmount ?? amount)}</dd></div></dl>
    <RequestPromotions snapshot={snapshot} locale={locale} money={money} review={review}/>
    <div className={`request-total ${amount===null?"is-pending":"is-known"}`}><span>{p("total")}</span><strong>{money(amount)}</strong><p>{p("managerNotice")}</p></div>
  </div>;
}
