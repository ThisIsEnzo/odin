"use client";
import {DurationSelector} from "./DurationSelector";
import {ItemEstimate} from "./Estimate";
import {useTranslations} from "next-intl";
import {experiences} from "@/data/odin/experiences";
import {getAvailableTimeSlots,todayIsoDate,maxIsoDate} from "@/lib/booking/time-slots";
import type {ActivityBookingItem} from "@/types/domain";
export const inputClass="form-control";
export function ActivityEditor({activity,path,onChange,error,included=false}:{activity:ActivityBookingItem;path:string;onChange:(a:ActivityBookingItem)=>void;error:(path:string)=>string|undefined;included?:boolean}) {
  const t=useTranslations("booking");
  const exp=experiences.find(e=>e.id===activity.experienceId)!;
  function feedback(name:string) {const text=error(`${path}.${name}`);return text?<p id={`${activity.id}-${name}-error`} className="mt-2 text-sm text-red-800" role="alert">{text}</p>:null;}
  const attrs=(name:string)=>({"aria-invalid":!!error(`${path}.${name}`),"aria-describedby":error(`${path}.${name}`)?`${activity.id}-${name}-error`:undefined});
  return <div className="mt-5 space-y-5">
    <p className="text-sm text-surface-dark">{t("v2.hours",exp.operatingHours)}</p>
    <div className="grid min-w-0 gap-5 sm:grid-cols-2">
      <div className="min-w-0"><label htmlFor={`${activity.id}-date`}>{t("fields.date")}</label><input id={`${activity.id}-date`} type="date" min={todayIsoDate()} max={maxIsoDate()} value={activity.date} onChange={e=>onChange({...activity,date:e.target.value})} className={inputClass} {...attrs("date")}/>{feedback("date")}</div>
      <div><label htmlFor={`${activity.id}-time`}>{t("fields.time")}</label><select id={`${activity.id}-time`} value={activity.time} onChange={e=>onChange({...activity,time:e.target.value})} className={inputClass} {...attrs("time")}><option value="">{t("v2.chooseTime")}</option>{getAvailableTimeSlots(exp,activity.durationMinutes).map(time=><option key={time}>{time}</option>)}</select>{feedback("time")}</div>
    </div>
    <DurationSelector experience={exp} value={activity.durationMinutes} id={activity.id} included={included} error={error(`${path}.durationMinutes`)} onChange={durationMinutes=>onChange({...activity,durationMinutes,time:getAvailableTimeSlots(exp,durationMinutes).includes(activity.time)?activity.time:""})}/>
    <div><label htmlFor={`${activity.id}-count`}>{t("fields.guests")}</label><input id={`${activity.id}-count`} type="number" inputMode="numeric" min={1} max={200} value={activity.participants.length||""} onChange={e=>{
      const count=Math.min(200,Math.max(0,Math.trunc(Number(e.target.value))));
      onChange({...activity,participants:Array.from({length:count},(_,i)=>activity.participants[i]??{id:crypto.randomUUID()})});
    }} className={inputClass} {...attrs("participants")}/>{feedback("participants")}</div>
    {exp.requiresWeight&&<fieldset className="space-y-3"><legend className="mb-3 text-sm text-ink/70">{t("v2.weightHelp",{max:exp.restrictions.maxWeightKg??""})}</legend><div className="grid gap-4 sm:grid-cols-2">{activity.participants.map((p,i)=><div key={p.id}><label htmlFor={`${p.id}-weight`}>{t("v2.guestWeight",{number:i+1})}</label><input id={`${p.id}-weight`} type="number" inputMode="decimal" min={0.1} step="any" value={p.weightKg??""} onChange={e=>onChange({...activity,participants:activity.participants.map((guest,j)=>j===i?{...guest,weightKg:e.target.value===""?undefined:Number(e.target.value)}:guest)})} className={inputClass} {...attrs(`participants.${i}.weightKg`)}/>{feedback(`participants.${i}.weightKg`)}</div>)}</div></fieldset>}
    {!included&&<ItemEstimate item={activity}/>}
  </div>;
}
