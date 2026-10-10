"use client";
import {DurationText, ItemEstimate, VisitEstimate} from "./Estimate";
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
import {ExperiencePicker} from "./ExperiencePicker";
import {VisitSummary, visitDate} from "./VisitSummary";

export interface BookingFlowProps {locale:Locale;initialExperienceId:ExperienceId|null;contextPackageId:string|null}
export function BookingFlow({locale,initialExperienceId,contextPackageId}:BookingFlowProps) {
  const t=useTranslations("booking"), all=useTranslations(), te=useTranslations("booking.errors");
  const [items,setItems]=useState<BookingItem[]>(()=>initializeVisit(initialExperienceId,contextPackageId));
  const [step,setStep]=useState(0), [editing,setEditing]=useState<string|null>(null);
  const [customer,setCustomer]=useState<BookingCustomer>({name:"",email:"",phone:""});
  const [notes,setNotes]=useState(""),[company,setCompany]=useState("");
  const [errors,setErrors]=useState<Record<string,FieldErrorEntry>>({}),[failure,setFailure]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false),[received,setReceived]=useState<string|null>(null);
  const submitting=useRef(false), heading=useRef<HTMLHeadingElement>(null),errorBox=useRef<HTMLDivElement>(null);
  const nameOf=(a:ActivityBookingItem)=>all(`${experiences.find(e=>e.id===a.experienceId)!.translationNamespace}.title`);
  const itemName=(item:BookingItem)=>item.type==="activity"?nameOf(item):all(`${packages.find(p=>p.id===item.packageId)!.translationNamespace}.title`);
  const error=(path:string)=>{const e=errors[path];return e?te.has(e.key)?te(e.key,e.params as Record<string,string|number>):te("invalidSubmission"):undefined;};
  const titles=[t("v2.choose"),t("v2.configure"),t("steps.details"),t("steps.review")];
  const defaultDate=items.flatMap(activitiesOf).find(a=>a.date)?.date??"";
  function go(next:number) {setStep(next);setNotice("");setErrors({});setFailure("");requestAnimationFrame(()=>heading.current?.focus());}
  function focusErrors(){requestAnimationFrame(()=>errorBox.current?.focus());}
  function changeActivity(a:ActivityBookingItem){setItems(old=>updateActivity(old,a));setErrors({});}
  function add(item:BookingItem){setItems(old=>[...old,item]);setEditing(item.id);go(1);setNotice(t("ux.addedName",{name:itemName(item)}));}
  function editItem(id:string){setEditing(id);go(1);}
  function itemReady(item:BookingItem){return visitSchema.safeParse([item]).success;}
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
  const attempt=useRef<{body:string;key:string}|null>(null);
  async function submit(){
    if(submitting.current)return;
    const parsed=bookingSchema.safeParse({schemaVersion:2,items,customer,notes,locale,company});
    if(!parsed.success){routeErrors(collectFieldErrors(parsed.error.issues));return;}
    submitting.current=true;setBusy(true);setFailure("");
    const requestBody=JSON.stringify(parsed.data);
    if(attempt.current?.body!==requestBody)attempt.current={body:requestBody,key:crypto.randomUUID()};
    try{const res=await fetch("/api/booking",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":attempt.current!.key},body:requestBody});const body=await res.json();
      if(res.status===201&&body.status==="received"&&typeof body.id==="string")setReceived(typeof body.reference==="string"?body.reference:body.id);
      else if(res.status===400&&body.fieldErrors)routeErrors(body.fieldErrors);
      else setFailure(te("networkFailed"));
    }catch{setFailure(te("networkFailed"));}finally{submitting.current=false;setBusy(false);}
  }
  function describeError(path:string){const parts=path.split(".");if(parts[0]!=="items")return "";const item=items[Number(parts[1])];if(!item)return "";const a=item.type==="activity"?item:item.components[Number(parts[3])];const pi=parts.indexOf("participants");return `${a?nameOf(a):itemName(item)}${pi>=0&&parts[pi+1]!==undefined?` — ${t("v2.guest",{number:Number(parts[pi+1])+1})}`:""}: `;}
  function optionsSummary(item:BookingItem){return item.options.map(o=><p key={o.optionId}>{all(`${bookingOptions.find(d=>d.id===o.optionId)!.translationNamespace}.name`)} × {o.quantity}</p>);}
  if(received)return <RequestReceived bookingId={received}/>;
  return <div className="booking-surface min-w-0">
    <div className="visit-heading">
      <p className="eyebrow text-brand-primary">{t("pageTitle")}</p>
      <h1>{t("v2.title")}</h1>
      <p>{t("v2.intro")}</p>
    </div>
    <ol aria-label={t("v2.progress")} className="visit-progress">{titles.map((title,i)=><li key={title} aria-current={step===i?"step":undefined} className={i<step?"is-past":""}><span aria-hidden="true">{i<step?"✓":`0${i+1}`}</span><span>{title}</span></li>)}</ol>
    <fieldset disabled={busy} className="visit-layout">
      <VisitSummary items={items} locale={locale} nameOf={nameOf} itemName={itemName} onEdit={editItem} onAdd={()=>go(0)}/>
      <div className="visit-main">
        <div className="visit-stage-heading"><h2 ref={heading} tabIndex={-1}>{titles[step]}</h2><p>{t(`ux.stage${step}`)}</p></div>
        <p role="status" aria-live="polite" className={notice?"visit-notice":"sr-only"}>{notice}</p>
        {Object.keys(errors).length>0&&<div ref={errorBox} tabIndex={-1} role="alert" className="visit-errors"><p className="font-semibold">{t("v2.fixErrors")}</p><ul>{Object.keys(errors).map(path=><li key={path}>{describeError(path)}{error(path)}</li>)}</ul></div>}
        {step===0&&<ExperiencePicker items={items} onActivity={id=>add(createActivity(id,defaultDate))} onPackage={id=>add(createPackage(id,defaultDate))} onEdit={editItem}/>}
        {step===1&&<div className="visit-itinerary">
          {items.length===0&&<p className="visit-empty">{t("ux.empty")}</p>}
          {items.map((item,i)=><article key={item.id} data-visit-item={item.id} className={`visit-entry ${editing===item.id?"is-editing":""}`}>
            <div className="visit-entry-heading">
              <span className="visit-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span>
              <div className="min-w-0"><p className="visit-kind">{item.type==="package"?t("ux.package"):t("ux.experience")}</p><h3>{itemName(item)}</h3><p className="visit-readiness">{editing===item.id?t("ux.editing"):itemReady(item)?t("ux.ready"):t("ux.needsDetails")}</p></div>
            </div>
            <div className="visit-entry-actions">{["edit","duplicate","remove"].map(action=><button key={action} type="button" aria-label={`${t(`v2.${action}`)}: ${itemName(item)}`} aria-expanded={action==="edit"?editing===item.id:undefined} aria-controls={action==="edit"?`editor-${item.id}`:undefined} className={`visit-quiet-action ${action==="remove"?"visit-remove":""}`} onClick={()=>{
              if(action==="edit")setEditing(editing===item.id?null:item.id);
              if(action==="duplicate"){const copy=duplicateItem(item);setItems(old=>[...old,copy]);setEditing(copy.id);setErrors({});setNotice(t("ux.addedName",{name:itemName(copy)}));}
              if(action==="remove"){setItems(old=>removeItem(old,item.id));if(editing===item.id)setEditing(null);setErrors({});setNotice("");}
            }}>{t(`v2.${action}`)}</button>)}</div>
            {item.type==="package"&&<p className="visit-package-note">{t("v2.packageNotice")}</p>}
            <div id={`editor-${item.id}`}>
              {editing===item.id?<div className="visit-editor">{activitiesOf(item).map((a,j)=><section key={a.id} className={j>0?"mt-8 border-t border-ink/15 pt-6":""}>{item.type==="package"&&<h4 className="text-lg font-medium">{nameOf(a)}</h4>}<ActivityEditor included={item.type==="package"} activity={a} path={item.type==="activity"?`items.${i}`:`items.${i}.components.${j}`} onChange={changeActivity} error={error}/><BookingOptions item={a} onChange={options=>changeActivity({...a,options})}/></section>)}{item.type==="package"&&<BookingOptions item={item} onChange={options=>setItems(old=>old.map(v=>v.id===item.id?{...item,options}:v))}/>}<button type="button" className={buttonVariants({variant:"outline",className:"mt-6"})} onClick={()=>{if(validateItems(item.id)){setEditing(null);setErrors({});setNotice("");}}}>{t("v2.done")} <span aria-hidden="true">✓</span></button></div>:activitiesOf(item).map(a=><div className="visit-collapsed" key={a.id}>{item.type==="package"&&<p className="font-medium">{nameOf(a)}</p>}<p>{a.date?visitDate(a.date,locale):t("v2.datePending")} · {a.time||t("v2.timePending")} · <DurationText minutes={a.durationMinutes}/> · {t("v2.guestCount",{count:a.participants.length})}</p>{a.participants.some(p=>p.weightKg!==undefined)&&<p className="text-sm text-text-secondary">{a.participants.filter(p=>p.weightKg!==undefined).map(p=>`${p.weightKg} kg`).join(" · ")}</p>}</div>)}
            </div>
            {(editing!==item.id||item.type==="package")&&<ItemEstimate item={item}/>}
            {item.type==="package"&&packages.find(p=>p.id===item.packageId)?.includesRestaurant&&<p className="visit-package-note">{t("v2.restaurantNotice")}</p>}
          </article>)}
          <button type="button" className="visit-add-another" onClick={()=>go(0)}><span aria-hidden="true">+</span>{t("ux.addAnother")}</button>
        </div>}
        {step===2&&<div><CustomerStep {...customer} notes={notes} company={company} onChange={(field,value)=>{if(field==="notes")setNotes(value);else if(field==="company")setCompany(value);else setCustomer(c=>({...c,[field]:value}));setErrors({});}} fieldErrorText={field=>error(`customer.${field}`)}/>
          {availableContactChannels(siteConfig).length>0&&<div className="mt-6"><label htmlFor="contact-channel">{t("v2.contactPreference")}</label><select id="contact-channel" className={inputClass} value={customer.preferredChannel??""} onChange={e=>setCustomer({...customer,preferredChannel:(e.target.value||undefined) as BookingCustomer["preferredChannel"],channelIdentity:undefined})}><option value="">{t("v2.noPreference")}</option>{availableContactChannels(siteConfig).map(c=><option value={c} key={c}>{t(`v2.channels.${c}`)}</option>)}</select>{(customer.preferredChannel==="line"||customer.preferredChannel==="whatsapp")&&<label className="mt-4 block">{t("v2.contactIdentity")}<input className={inputClass} value={customer.channelIdentity??""} onChange={e=>setCustomer({...customer,channelIdentity:e.target.value})}/></label>}</div>}
        </div>}
        {step===3&&<div className="visit-review">
          <p className="visit-review-note">{t("v2.reviewNotice")}</p>
          {items.map((item,i)=><section key={item.id} className="visit-review-entry"><div className="visit-entry-heading"><span className="visit-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span><div><p className="visit-kind">{item.type==="package"?t("ux.package"):t("ux.experience")}</p><h3>{itemName(item)}</h3></div></div>
            {activitiesOf(item).map(a=><div className="visit-review-activity" key={a.id}>{item.type==="package"&&<h4>{nameOf(a)}</h4>}<dl><div><dt>{t("fields.date")}</dt><dd>{visitDate(a.date,locale)}</dd></div><div><dt>{t("fields.time")}</dt><dd>{a.time}</dd></div><div><dt>{t("pricing.duration")}</dt><dd><DurationText minutes={a.durationMinutes}/></dd></div><div><dt>{t("fields.guests")}</dt><dd>{a.participants.length}</dd></div></dl>{a.participants.some(p=>p.weightKg!==undefined)&&<p className="visit-weight-summary">{a.participants.map((p,i)=>`${t("v2.guest",{number:i+1})}: ${p.weightKg} kg`).join(" · ")}</p>}{optionsSummary(a)}</div>)}
            {item.type==="package"&&<><p className="visit-package-note">{t("v2.packageNotice")}</p>{packages.find(p=>p.id===item.packageId)?.includesRestaurant&&<p className="visit-package-note">{t("v2.restaurantNotice")}</p>}{optionsSummary(item)}</>}
            <ItemEstimate item={item}/>
            <button type="button" className="visit-quiet-action" onClick={()=>editItem(item.id)}>{t("v2.edit")}</button>
          </section>)}
          <VisitEstimate items={items}/>
          <section className="visit-review-entry"><h3>{t("steps.details")}</h3><p className="mt-4 break-words">{customer.name}<br/>{customer.email}<br/>{customer.phone}</p>{customer.preferredChannel&&<p>{t(`v2.channels.${customer.preferredChannel}`)}: {customer.channelIdentity??(customer.preferredChannel==="email"?customer.email:customer.phone)}</p>}{notes&&<div className="mt-5"><p className="visit-kind">{t("fields.notes")}</p><p className="whitespace-pre-wrap break-words">{notes}</p></div>}<button type="button" className="visit-quiet-action" onClick={()=>go(2)}>{t("v2.edit")}</button></section>
        </div>}
        {failure&&<p className="visit-errors" role="alert">{failure}</p>}
        <div className="visit-stage-actions">{step>0&&<button type="button" className="visit-quiet-action" onClick={()=>go(step-1)}>← {t("actions.back")}</button>}<button type="button" aria-busy={busy} className={buttonVariants({variant:"primary",size:"lg",className:"ml-auto"})} onClick={step===3?submit:next}>{busy?t("actions.submitting"):step===3?t("actions.submit"):step===2?t("ux.reviewCta"):step===1?t("ux.detailsCta"):t("actions.next")}<span aria-hidden="true">→</span></button></div>
      </div>
    </fieldset>
  </div>;
}
