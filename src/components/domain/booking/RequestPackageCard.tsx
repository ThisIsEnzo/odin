"use client";
import {useTranslations} from "next-intl";
import {experiences} from "@/data/odin/experiences";
import {createPackageSelection} from "@/lib/booking/request";
import type {Package,BookingPackageSelection} from "@/types/domain";
export function RequestPackageCard({pack,selection,onChange,price}:{pack:Package;selection?:BookingPackageSelection;onChange:(value?:BookingPackageSelection)=>void;price:string}) {
 const all=useTranslations(),t=useTranslations("booking.v3"),p=useTranslations("booking.pricing");
 const name=all(`${pack.translationNamespace}.title`);
 return <article data-package={pack.id} className={`request-package ${selection?"is-included":""}`}>
  <div className="request-card-body"><h3>{name}</h3><p className="request-description">{all(`${pack.translationNamespace}.description`)}</p>
   {selection && <p className="request-package-included">✓ {t("included")}</p>}
   <ul className="request-package-components">{(selection?.components ?? pack.components ?? []).map((component,index)=>{
    const activity=experiences.find(e=>e.id===component.activityId)!;
    return <li key={component.activityId}><strong>{all(`${activity.translationNamespace}.title`)}</strong><p>{t("guestSummary",{count:component.guestCount})}{component.unitCount!==undefined?` · ${all("booking.units.atv")}: ${component.unitCount}`:""}</p>
     {selection ? <label>{p("duration")}<select className="request-input" disabled={pack.components?.[index]?.durationMinutes!==undefined} aria-label={`${name}: ${all(`${activity.translationNamespace}.title`)} — ${p("duration")}`} value={component.durationMinutes??""} onChange={e=>onChange({...selection,components:selection.components.map((c,i)=>i===index?{...c,durationMinutes:e.target.value?Number(e.target.value):undefined}:c)})}>
       <option value="">{p("pending")}</option>{activity.durationOptions?.map(tier=><option key={tier.durationMinutes} value={tier.durationMinutes}>{p("minutes",{count:tier.durationMinutes})}</option>)}</select></label>:<p>{p("pending")}</p>}
    </li>;
   })}</ul>
   <div className="request-card-bottom"><div><span>{all("booking.packages.subtotal")}</span><p>{price}</p></div>
    <button type="button" className={selection?"request-remove":"request-add"} aria-label={`${selection?t("remove"):all("packages.cta")}: ${name}`} onClick={()=>onChange(selection?undefined:createPackageSelection(pack))}>{selection?t("remove"):all("packages.cta")}</button>
   </div>
  </div>
 </article>;
}
