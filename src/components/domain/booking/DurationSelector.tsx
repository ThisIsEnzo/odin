"use client";
import {useTranslations} from "next-intl";
import type {Experience} from "@/types/domain";
import {EstimateAmount} from "./Estimate";

export function DurationSelector({experience,value,onChange,error,included=false,id}:{experience:Experience;value?:number;onChange:(minutes:number)=>void;error?:string;included?:boolean;id:string}) {
 const t=useTranslations("booking.pricing");
 const tiers=experience.durationOptions??[];
 return <fieldset className="duration-selector" aria-describedby={error?`${id}-duration-error`:`${id}-duration-help`}>
  <legend>{t("duration")}</legend>
  {tiers.length>0?<div className="duration-choices">{tiers.map(tier=><button key={tier.durationMinutes} type="button" aria-pressed={value===tier.durationMinutes} onClick={()=>onChange(tier.durationMinutes)}>
   <span>{t("minutes",{count:tier.durationMinutes})}{value===tier.durationMinutes&&<span aria-hidden="true"> ✓</span>}</span>
   <small>{included?t("included"):<><EstimateAmount amount={tier.price.amount}/> · {t(`unit.${tier.price.unit}`)}</>}</small>
  </button>)}</div>:<p className="duration-unavailable">{t("durationPending")}</p>}
  <p id={`${id}-duration-help`} className="visit-package-note">{tiers.length?t("durationHelp"):t("missingTiers")}</p>
  {error&&<p id={`${id}-duration-error`} className="text-sm text-error mt-2" role="alert">{error}</p>}
 </fieldset>;
}
