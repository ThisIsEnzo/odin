"use client";
import {useFormatter, useTranslations} from "next-intl";
import {calculateBookingEstimate} from "@/lib/booking/pricing";
import type {BookingItem} from "@/types/domain";

export function EstimateAmount({amount}:{amount:number|null}) {
  const t=useTranslations("booking.pricing"), format=useFormatter();
  return <>{amount === null ? t("pending") : format.number(amount,{style:"currency",currency:"THB",maximumFractionDigits:2})}</>;
}
export function ItemEstimate({item}:{item:BookingItem}) {
  const t=useTranslations("booking.pricing");
  return <p className="visit-item-estimate">{t("subtotal")} <span><EstimateAmount amount={calculateBookingEstimate([item]).amount}/></span></p>;
}
export function VisitEstimate({items,compact=false}:{items:BookingItem[];compact?:boolean}) {
  const t=useTranslations("booking.pricing");
  return <div className={compact?"visit-estimate-compact":"visit-estimate"}>
    <p>{t("total")} <strong><EstimateAmount amount={calculateBookingEstimate(items).amount}/></strong></p>
    {!compact&&<p className="visit-estimate-notice">{t("managerNotice")}</p>}
  </div>;
}
export function DurationText({minutes}:{minutes?:number}) {
  const t=useTranslations("booking.pricing");
  return <>{minutes === undefined ? t("durationPending") : t("minutes",{count:minutes})}</>;
}
