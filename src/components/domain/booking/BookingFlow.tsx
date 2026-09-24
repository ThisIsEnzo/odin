"use client";
import {useRef,useState} from "react";
import {useTranslations} from "next-intl";
import {experiences} from "@/data/odin/experiences";
import {packages} from "@/data/odin/packages";
import {bookingOptions} from "@/data/odin/booking-options";
import {siteConfig} from "@/data/odin/site";
import type {ActivityBookingItem,BookingItem,BookingCustomer,ExperienceId,Locale} from "@/types/domain";
import {activitiesOf,createActivity,createPackage,duplicateItem,initializeVisit,removeItem,updateActivity} from "@/lib/booking/itinerary";
import {availableContactChannels} from "@/lib/booking/rules";
import {bookingSchema,visitSchema,customerSchema,collectFieldErrors,type FieldErrorEntry} from "@/lib/validation/booking.schema";
import {buttonVariants} from "@/components/ui/Button";
import {CustomerStep} from "./steps/CustomerStep";
import {RequestReceived} from "./RequestReceived";
import {ActivityEditor,inputClass} from "./ActivityEditor";
import {BookingOptions} from "./BookingOptions";

export interface BookingFlowProps {locale:Locale;initialExperienceId:ExperienceId|null;contextPackageId:string|null}
export function BookingFlow({locale,initialExperienceId,contextPackageId}:BookingFlowProps) {
  const t=useTranslations("booking"), all=useTranslations(), te=useTranslations("booking.errors");
  const [items,setItems]=useState<BookingItem[]>(()=>initializeVisit(initialExperienceId,contextPackageId));
  const [step,setStep]=useState(0), [editing,setEditing]=useState<string|null>(null);
  const [customer,setCustomer]=useState<BookingCustomer>({name:"",email:"",phone:""});
  const [notes,setNotes]=useState(""),[company,setCompany]=useState("");
  const [errors,setErrors]=useState<Record<string,FieldErrorEntry>>({}),[failure,setFailure]=useState("");
  const [busy,setBusy]=useState(false),[received,setReceived]=useState<string|null>(null);
  const submitting=useRef(false), heading=useRef<HTMLHeadingElement>(null),errorBox=useRef<HTMLDivElement>(null);
  const nameOf=(a:ActivityBookingItem)=>all(`${experiences.find(e=>e.id===a.experienceId)!.translationNamespace}.name`);
  const itemName=(item:BookingItem)=>item.type==="activity"?nameOf(item):all(`${packages.find(p=>p.id===item.packageId)!.translationNamespace}.name`);
  const error=(path:string)=>{const e=errors[path];return e?te.has(e.key)?te(e.key,e.params as Record<string,string|number>):te("invalidSubmission"):undefined;};
  const titles=[t("v2.choose"),t("v2.configure"),t("steps.details"),t("steps.review")];
  const defaultDate=items.flatMap(activitiesOf).find(a=>a.date)?.date??"";
  function go(next:number) {setStep(next);setErrors({});setFailure("");requestAnimationFrame(()=>heading.current?.focus());}
  function focusErrors(){requestAnimationFrame(()=>errorBox.current?.focus());}
  function changeActivity(a:ActivityBookingItem){setItems(old=>updateActivity(old,a));setErrors({});}
  function add(item:BookingItem){setItems(old=>[...old,item]);setEditing(item.id);go(1);}
  function validateItems(onlyId?:string) {
    const r=visitSchema.safeParse(items);
    if(r.success)return true;
    const relevant=r.error.issues.filter(i=>!onlyId||items[Number(i.path[0])]?.id===onlyId);
    if(!relevant.length)return true;
    setErrors(collectFieldErrors(relevant.map(i=>({...i,path:["items",...i.path]}))));
    setEditing(items[Number(relevant[0]?.path[0])]?.id??null);focusErrors();return false;
  }
  function next() {
    if(step===0){if(!items.length){setErrors({items:{key:"emptyVisit"}});focusErrors();return;}go(1);setEditing(items[0]?.id??null);}
    else if(step===1){if(validateItems())go(2);}
    else if(step===2){const r=customerSchema.safeParse(customer);if(!r.success){setErrors(collectFieldErrors(r.error.issues.map(i=>({...i,path:["customer",...i.path]}))));focusErrors();return;}go(3);}
  }
  function routeErrors(e:Record<string,FieldErrorEntry>){const first=Object.keys(e)[0]??"";if(first.startsWith("items")){setStep(1);setEditing(items[Number(first.split(".")[1])]?.id??null);}else setStep(2);setErrors(e);focusErrors();}
  async function submit(){
    if(submitting.current)return;
    const parsed=bookingSchema.safeParse({schemaVersion:2,items,customer,notes,locale,company});
    if(!parsed.success){routeErrors(collectFieldErrors(parsed.error.issues));return;}
    submitting.current=true;setBusy(true);setFailure("");
    try{const res=await fetch("/api/booking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});const body=await res.json();
      if(res.status===201&&body.status==="received"&&typeof body.id==="string")setReceived(body.id);
      else if(res.status===400&&body.fieldErrors)routeErrors(body.fieldErrors);
      else setFailure(te("networkFailed"));
    }catch{setFailure(te("networkFailed"));}finally{submitting.current=false;setBusy(false);}
  }
  function summaryActivity(a:ActivityBookingItem){return <div key={a.id} className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-medium">{nameOf(a)}</span><span className="text-sm text-ink/70">{a.date||t("v2.datePending")} · {a.time||t("v2.timePending")} · {t("v2.guestCount",{count:a.participants.length})}</span></div>;}
  function describeError(path:string){const parts=path.split(".");if(parts[0]!=="items")return "";const item=items[Number(parts[1])];if(!item)return "";const a=item.type==="activity"?item:item.components[Number(parts[3])];const pi=parts.indexOf("participants");return `${a?nameOf(a):itemName(item)}${pi>=0&&parts[pi+1]!==undefined?` — ${t("v2.guest",{number:Number(parts[pi+1])+1})}`:""}: `;}
  function optionsSummary(item:BookingItem){return item.options.map(o=><p key={o.optionId}>{all(`${bookingOptions.find(d=>d.id===o.optionId)!.translationNamespace}.name`)} × {o.quantity}</p>);}
  if(received)return <RequestReceived bookingId={received}/>;
  return <div className="min-w-0">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-moss">{t("pageTitle")}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{t("v2.title")}</h1>
    <p className="mt-4 max-w-xl text-ink/70">{t("v2.intro")}</p>
    <ol aria-label={t("v2.progress")} className="my-8 grid grid-cols-4 gap-2">{titles.map((title,i)=><li key={title} aria-current={step===i?"step":undefined} className={`border-t-2 pt-3 text-xs sm:text-sm ${step===i?"border-moss font-semibold text-moss":"border-ink/15 text-ink/60"}`}><span className="block">0{i+1}</span><span className="mt-1 block break-words">{title}</span></li>)}</ol>
    <h2 ref={heading} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-3xl">{titles[step]}</h2>
    {Object.keys(errors).length>0&&<div ref={errorBox} tabIndex={-1} role="alert" className="mt-5 rounded-lg border border-red-800/25 bg-red-50 p-4 text-sm text-red-900 outline-none"><p className="font-semibold">{t("v2.fixErrors")}</p><ul className="mt-2 space-y-2">{Object.keys(errors).map(path=><li key={path}>{describeError(path)}{error(path)}</li>)}</ul></div>}
    <fieldset disabled={busy} className="mt-6 min-w-0">
    {step===0&&<div className="space-y-8">
      {items.length>0&&<div className="border-y border-moss/20 py-4"><p className="text-sm font-medium">{t("v2.selected")}</p>{items.map(item=><p key={item.id} className="mt-2">{itemName(item)}</p>)}</div>}
      <div className="grid gap-3 sm:grid-cols-2">{experiences.map(e=><button key={e.id} type="button" onClick={()=>add(createActivity(e.id,defaultDate))} className="flex min-h-24 items-center justify-between gap-4 rounded-xl border border-moss/20 bg-canvas-soft p-5 text-left hover:border-moss focus-visible:outline-2 focus-visible:outline-moss"><span className="text-lg font-medium">{all(`${e.translationNamespace}.name`)}</span><span aria-hidden="true" className="text-2xl text-moss">+</span></button>)}</div>
      <div><h3 className="mb-3 text-xl font-medium">{t("v2.packages")}</h3><p className="mb-4 text-sm text-ink/60">{t("v2.packageNotice")}</p>{packages.map(p=><button key={p.id} type="button" onClick={()=>add(createPackage(p.id,defaultDate))} className="flex w-full items-center justify-between gap-4 border-t border-ink/15 py-5 text-left"><span><span className="block text-lg font-medium">{all(`${p.translationNamespace}.name`)}</span><span className="mt-1 block text-sm text-ink/65">{p.includedExperienceIds.map(id=>all(`${experiences.find(e=>e.id===id)!.translationNamespace}.name`)).join(" · ")}{p.includesRestaurant?` · ${t("v2.restaurant")}`:""}</span></span><span aria-hidden="true">+</span></button>)}</div>
    </div>}
    {step===1&&<div className="space-y-4">{items.map((item,i)=><article key={item.id} className="rounded-xl border border-moss/20 bg-canvas-soft/60 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl font-semibold">{itemName(item)}</h3><div className="flex flex-wrap gap-1">{["edit","duplicate","remove"].map(action=><button key={action} type="button" aria-label={`${t(`v2.${action}`)}: ${itemName(item)}`} className="min-h-11 rounded px-2 text-sm text-moss underline underline-offset-4 focus-visible:outline-2" onClick={()=>{
        if(action==="edit")setEditing(editing===item.id?null:item.id);
        if(action==="duplicate"){const copy=duplicateItem(item);setItems(old=>[...old,copy]);setEditing(copy.id);setErrors({});}
        if(action==="remove"){setItems(old=>removeItem(old,item.id));setErrors({});}
      }}>{t(`v2.${action}`)}</button>)}</div></div>
      {item.type==="package"&&<p className="mt-2 text-sm text-ink/60">{t("v2.packageNotice")}</p>}
      {editing===item.id?<div>{activitiesOf(item).map((a,j)=><section key={a.id} className={j>0?"mt-6 border-t border-ink/15 pt-5":""}>{item.type==="package"&&<h4 className="mt-5 font-semibold">{nameOf(a)}</h4>}<ActivityEditor activity={a} path={item.type==="activity"?`items.${i}`:`items.${i}.components.${j}`} onChange={changeActivity} error={error}/><BookingOptions item={a} onChange={options=>changeActivity({...a,options})}/></section>)}{item.type==="package"&&<BookingOptions item={item} onChange={options=>setItems(old=>old.map(v=>v.id===item.id?{...item,options}:v))}/>}<button type="button" className={buttonVariants({variant:"outline",className:"mt-5"})} onClick={()=>{if(validateItems(item.id)){setEditing(null);setErrors({});}}}>{t("v2.done")}</button></div>:activitiesOf(item).map(summaryActivity)}
      {item.type==="package"&&packages.find(p=>p.id===item.packageId)?.includesRestaurant&&<p className="mt-4 border-t border-ink/10 pt-3 text-sm text-ink/70">{t("v2.restaurantNotice")}</p>}
    </article>)}<button type="button" className={buttonVariants({variant:"outline",className:"w-full whitespace-normal"})} onClick={()=>go(0)}>{t("v2.addActivity")}</button></div>}
    {step===2&&<div><CustomerStep {...customer} notes={notes} company={company} onChange={(field,value)=>{if(field==="notes")setNotes(value);else if(field==="company")setCompany(value);else setCustomer(c=>({...c,[field]:value}));setErrors({});}} fieldErrorText={field=>error(`customer.${field}`)}/>
      {availableContactChannels(siteConfig).length>0&&<div className="mt-5"><label htmlFor="contact-channel">{t("v2.contactPreference")}</label><select id="contact-channel" className={inputClass} value={customer.preferredChannel??""} onChange={e=>setCustomer({...customer,preferredChannel:(e.target.value||undefined) as BookingCustomer["preferredChannel"],channelIdentity:undefined})}><option value="">{t("v2.noPreference")}</option>{availableContactChannels(siteConfig).map(c=><option value={c} key={c}>{t(`v2.channels.${c}`)}</option>)}</select>{(customer.preferredChannel==="line"||customer.preferredChannel==="whatsapp")&&<label className="mt-4 block">{t("v2.contactIdentity")}<input className={inputClass} value={customer.channelIdentity??""} onChange={e=>setCustomer({...customer,channelIdentity:e.target.value})}/></label>}</div>}
    </div>}
    {step===3&&<div className="space-y-6">
      <p className="text-sm text-moss">{t("v2.reviewNotice")}</p>
      {Array.from(new Set(items.flatMap(activitiesOf).map(a=>a.date))).sort().map(date=><section key={date} className="border-t border-ink/20 pt-5"><h3 className="text-lg font-semibold">{new Intl.DateTimeFormat(locale,{dateStyle:"long",timeZone:"Asia/Bangkok"}).format(new Date(date+"T00:00:00+07:00"))}</h3>{items.map(item=>activitiesOf(item).filter(a=>a.date===date).map(a=><div key={a.id} className="mt-4 border-l-2 border-moss/30 pl-4">{item.type==="package"&&<p className="text-xs text-moss">{itemName(item)}</p>}{summaryActivity(a)}{a.participants.some(p=>p.weightKg!==undefined)&&<p className="mt-2 text-sm text-ink/70">{a.participants.map((p,i)=>`${t("v2.guest",{number:i+1})}: ${p.weightKg} kg`).join(" · ")}</p>}{optionsSummary(a)}<button type="button" className="mt-2 min-h-11 text-sm text-moss underline" onClick={()=>{go(1);setEditing(item.id);}}>{t("v2.edit")}</button></div>))}</section>)}
      {items.filter(i=>i.type==="package").map(item=><div key={item.id} className="text-sm"><p className="font-semibold">{itemName(item)}</p><p>{t("v2.packageNotice")}</p>{packages.find(p=>p.id===item.packageId)?.includesRestaurant&&<p>{t("v2.restaurantNotice")}</p>}{optionsSummary(item)}</div>)}
      <section className="border-t border-ink/20 pt-5"><h3 className="font-semibold">{t("steps.details")}</h3><p className="mt-3 break-words">{customer.name}<br/>{customer.email}<br/>{customer.phone}</p>{customer.preferredChannel&&<p>{t(`v2.channels.${customer.preferredChannel}`)}: {customer.channelIdentity??(customer.preferredChannel==="email"?customer.email:customer.phone)}</p>}{notes&&<p className="mt-3 whitespace-pre-wrap break-words">{notes}</p>}<button type="button" className="mt-2 min-h-11 text-sm text-moss underline" onClick={()=>go(2)}>{t("v2.edit")}</button></section>
    </div>}
    {failure&&<p className="mt-4 text-red-800" role="alert">{failure}</p>}
    <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-ink/15 pt-6">{step>0&&<button type="button" className={buttonVariants({variant:"ghost"})} onClick={()=>go(step-1)}>{t("actions.back")}</button>}<button type="button" aria-busy={busy} className={buttonVariants({variant:"primary",className:"ml-auto max-w-full whitespace-normal text-center"})} onClick={step===3?submit:next}>{busy?t("actions.submitting"):step===3?t("actions.submit"):t("actions.next")}</button></div>
    </fieldset>
  </div>;
}
