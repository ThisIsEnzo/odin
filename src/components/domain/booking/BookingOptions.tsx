"use client";
import {useTranslations} from "next-intl";
import {bookingOptions} from "@/data/odin/booking-options";
import type {BookingItem,BookingOptionSelection} from "@/types/domain";
import {inputClass} from "./ActivityEditor";
export function BookingOptions({item,onChange}:{item:BookingItem;onChange:(options:BookingOptionSelection[])=>void}) {
 const t=useTranslations();
 const definitions=bookingOptions.filter(o=>item.type==="activity"?o.applicableTo.experienceIds?.includes(item.experienceId):o.applicableTo.packageIds?.includes(item.packageId));
 if(!definitions.length)return null;
 return <fieldset className="mt-5"><legend>{t("booking.v2.options")}</legend>{definitions.map(o=><label className="mt-3 block" key={o.id}>{t(`${o.translationNamespace}.name`)}<input type="number" min={0} max={o.constraints.maxQuantity} className={inputClass} value={item.options.find(s=>s.optionId===o.id)?.quantity??0} onChange={e=>onChange([...item.options.filter(s=>s.optionId!==o.id),...(Number(e.target.value)>0?[{optionId:o.id,quantity:Number(e.target.value)}]:[])])}/></label>)}</fieldset>;
}
