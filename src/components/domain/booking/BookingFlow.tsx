"use client";
import {useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {bookableExperiences} from "@/data/odin/experiences";
import type {BookingActivitySelection, BookingRequestDraft, ExperienceId, Locale} from "@/types/domain";
import {bookingRequestSchema, calculateRequestEstimate, createSelection} from "@/lib/booking/request";
import {maxBookingDate, thailandToday} from "@/lib/booking/rules";
import {collectFieldErrors, type FieldErrorEntry} from "@/lib/validation/booking.schema";
import {buttonVariants} from "@/components/ui/Button";
import {RequestReceived} from "./RequestReceived";
import {RequestActivityCard} from "./RequestActivityCard";

export interface BookingFlowProps {locale: Locale; initialExperienceId: ExperienceId | null; contextPackageId: string | null}
export function BookingFlow({locale, initialExperienceId, contextPackageId}: BookingFlowProps) {
  const t = useTranslations("booking.v3"), all = useTranslations(), p = useTranslations("booking.pricing"), te = useTranslations("booking.errors");
  const catalog = bookableExperiences();
  const [draft, setDraft] = useState<BookingRequestDraft>(() => ({schemaVersion: 3, visitDate: "", preferredStartTime: "", customer: {fullName: "", email: "", phone: ""}, locale,
    activities: catalog.filter(e => e.id === initialExperienceId).map(createSelection), notes: ""}));
  const [review, setReview] = useState(false), [received, setReceived] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, FieldErrorEntry>>({}), [failure, setFailure] = useState("");
  const [company, setCompany] = useState(""), [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const submitting = useRef(false), attempt = useRef<{body: string; key: string} | null>(null);
  const heading = useRef<HTMLHeadingElement>(null), errorBox = useRef<HTMLDivElement>(null);
  const estimate = calculateRequestEstimate(draft);
  const money = (amount: number | null) => amount === null ? p("pending") : new Intl.NumberFormat(locale, {style: "currency", currency: "THB", maximumFractionDigits: 2}).format(amount);
  const duration = (minutes?: number) => minutes === undefined ? p("pending") : p("minutes", {count: minutes});
  const date = (value: string) => new Intl.DateTimeFormat(locale, {day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok"}).format(new Date(`${value}T12:00:00+07:00`));
  const message = (path: string) => {const e = errors[path]; return e ? te.has(e.key) ? te(e.key, e.params as Record<string, string | number>) : te("invalidSubmission") : undefined;};
  function change(value: Partial<BookingRequestDraft>) {setDraft(old => ({...old, ...value})); setErrors({}); setFailure("");}
  function select(activityId: string, selection?: BookingActivitySelection) {
    const previous = draft.activities.find(a => a.activityId === activityId);
    change({activities: catalog.flatMap(e => {const chosen = e.id === activityId ? selection : draft.activities.find(a => a.activityId === e.id); return chosen ? [chosen] : [];})});
    if (!previous || !selection) setNotice(t(selection ? "added" : "removed", {name: all(`${catalog.find(e => e.id === activityId)!.translationNamespace}.title`)}));
  }
  function showErrors(value: Record<string, FieldErrorEntry>) {setErrors(value); setReview(false); requestAnimationFrame(() => errorBox.current?.focus());}
  function goReview() {
    const result = bookingRequestSchema.safeParse({...draft, locale, company});
    if (!result.success) {showErrors(collectFieldErrors(result.error.issues)); return;}
    const {company: ignored, ...clean} = result.data; void ignored;
    setDraft(clean); setReview(true); setErrors({}); setFailure(""); requestAnimationFrame(() => heading.current?.focus());
  }
  function edit() {setReview(false); setFailure(""); requestAnimationFrame(() => heading.current?.focus());}
  async function submit() {
    if (submitting.current) return;
    const result = bookingRequestSchema.safeParse({...draft, locale, company});
    if (!result.success) {showErrors(collectFieldErrors(result.error.issues)); return;}
    const body = JSON.stringify(result.data);
    if (attempt.current?.body !== body) attempt.current = {body, key: crypto.randomUUID()};
    submitting.current = true; setBusy(true); setFailure("");
    try {
      const res = await fetch("/api/booking", {method: "POST", headers: {"Content-Type": "application/json", "Idempotency-Key": attempt.current!.key}, body});
      const response = await res.json();
      if (res.status === 201 && response.status === "received" && typeof response.id === "string") setReceived(typeof response.reference === "string" ? response.reference : response.id);
      else if (res.status === 400 && response.fieldErrors) showErrors(response.fieldErrors);
      else setFailure(te("networkFailed"));
    } catch {setFailure(te("networkFailed"));}
    finally {submitting.current = false; setBusy(false);}
  }
  function errorTarget(path: string) {
    if (path.startsWith("activities.")) return `activity-${draft.activities[Number(path.split(".")[1])]?.activityId ?? "choices"}`;
    return path === "activities" ? "request-choices" : `request-${path.replace("customer.", "")}`;
  }
  function errorLabel(path: string) {
    if (!path.startsWith("activities.")) return "";
    const activity = catalog.find(e => e.id === draft.activities[Number(path.split(".")[1])]?.activityId);
    return activity ? `${all(`${activity.translationNamespace}.title`)}: ` : "";
  }
  const input = (field: "visitDate" | "preferredStartTime" | "fullName" | "email" | "phone", label: string, type: string, autocomplete?: string) => {
    const contact = field !== "visitDate" && field !== "preferredStartTime", path = contact ? `customer.${field}` : field;
    const value = contact ? draft.customer[field as keyof BookingRequestDraft["customer"]] : draft[field as "visitDate" | "preferredStartTime"];
    return <div className="request-field"><label htmlFor={`request-${field}`}>{label}</label><input id={`request-${field}`} name={field} className="request-input" type={type} required value={value} autoComplete={autocomplete}
      maxLength={field === "fullName" ? 120 : field === "email" ? 254 : field === "phone" ? 30 : undefined}
      min={field === "visitDate" ? thailandToday() : undefined} max={field === "visitDate" ? maxBookingDate() : undefined}
      aria-invalid={!!message(path)} aria-describedby={message(path) ? `request-${field}-error` : field === "preferredStartTime" ? "request-time-help" : undefined}
      onChange={e => contact ? change({customer: {...draft.customer, [field]: e.target.value}}) : change({[field]: e.target.value})}/>
      {message(path) && <p className="request-field-error" id={`request-${field}-error`}>{message(path)}</p>}
    </div>;
  };
  if (received) return <RequestReceived bookingId={received}/>;
  return <div className="booking-surface request-flow">
    <div className="request-heading"><p className="eyebrow text-brand-primary">ON GROUND · KHAO MAI KAEO</p>
      <h1 ref={heading} tabIndex={-1}>{t(review ? "reviewTitle" : "title")}</h1><p>{t(review ? "reviewIntro" : "intro")}</p>
    </div>
    {Object.keys(errors).length > 0 && <div ref={errorBox} tabIndex={-1} role="alert" className="request-errors"><p>{t("fixErrors")}</p><ul>{Object.keys(errors).map(path => <li key={path}><a href={`#${errorTarget(path)}`}>{errorLabel(path)}{message(path)}</a></li>)}</ul></div>}
    <p role="status" aria-live="polite" className="sr-only">{notice}</p>
    {!review ? <form noValidate onSubmit={e => {e.preventDefault(); goReview();}}>
      <fieldset disabled={busy} className="request-form-fields">
        <section className="request-section" aria-labelledby="request-visit-title"><div className="request-section-heading"><span aria-hidden="true">01</span><h2 id="request-visit-title">{t("visitTitle")}</h2></div>
          <div className="request-visit-fields">{input("visitDate", t("date"), "date")}{input("preferredStartTime", t("time"), "time")}</div>
          <p className="request-help" id="request-time-help">{t("timeHelp")}</p>
          <div className="request-contact-fields">{input("fullName", t("fullName"), "text", "name")}{input("email", t("email"), "email", "email")}{input("phone", t("phone"), "tel", "tel")}</div>
        </section>
        <section className="request-section" id="request-choices" tabIndex={-1} aria-labelledby="request-choices-title"><div className="request-section-heading"><span aria-hidden="true">02</span><h2 id="request-choices-title">{t("choicesTitle")}</h2></div>
          <p className="request-help">{t("choicesHelp")}</p>{contextPackageId && <p className="request-package-note">{t("packageNote")}</p>}
          {message("activities") && <p className="request-field-error">{message("activities")}</p>}
          <div className="request-card-grid">{catalog.map(activity => {
            const index = draft.activities.findIndex(a => a.activityId === activity.id), selection = draft.activities[index];
            return <RequestActivityCard key={activity.id} activity={activity} selection={selection} onChange={value => select(activity.id, value)}
              error={field => message(`activities.${index}.${field}`)} price={money(estimate.items.find(item => item.itemId === activity.id)?.amount ?? null)}/>;
          })}</div>
        </section>
        <section className="request-section request-notes"><label htmlFor="request-notes">{t("notes")}</label><span>{t("optional")}</span>
          <textarea className="request-input" id="request-notes" name="notes" rows={4} maxLength={500} value={draft.notes ?? ""} aria-invalid={!!message("notes")} onChange={e => change({notes: e.target.value})}/>
          {message("notes") && <p className="request-field-error">{message("notes")}</p>}
        </section>
        <div className="sr-only" aria-hidden="true"><label htmlFor="request-company">Company</label><input id="request-company" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={e => setCompany(e.target.value)}/></div>
        <div className="request-actions"><p>{draft.activities.length ? t("selectionCount", {count: draft.activities.length}) : t("noneSelected")}</p><button type="submit" className={buttonVariants({variant: "primary", size: "lg"})}>{t("review")} <span aria-hidden="true">→</span></button></div>
        <p className="request-disclaimer">{t("requestNotice")}</p>
      </fieldset>
    </form> : <div className="request-review">
      <section className="request-section"><h2>{t("visitTitle")}</h2><dl className="request-review-details"><div><dt>{t("date")}</dt><dd>{date(draft.visitDate)}</dd></div><div><dt>{t("time")}</dt><dd>{draft.preferredStartTime}</dd></div></dl><p className="request-help">{t("timeHelp")}</p></section>
      <section className="request-section"><h2>{t("contactTitle")}</h2><dl className="request-review-details"><div><dt>{t("fullName")}</dt><dd>{draft.customer.fullName}</dd></div><div><dt>{t("email")}</dt><dd>{draft.customer.email}</dd></div><div><dt>{t("phone")}</dt><dd>{draft.customer.phone}</dd></div></dl></section>
      <section className="request-section"><h2>{t("experiencesTitle")}</h2>{draft.activities.map((selection, index) => {
        const activity = catalog.find(e => e.id === selection.activityId)!;
        return <article className="request-review-activity" key={activity.id}><span className="request-review-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{all(`${activity.translationNamespace}.title`)}</h3>
          <p>{t("guestSummary", {count: selection.guestCount})} · {duration(selection.durationMinutes)}</p>
          {activity.booking?.model === "capacity_unit" && <p>{all(activity.booking.unitTranslationKey)}: {selection.unitCount} · {t("capacityHelp", {max: activity.booking.maxGuestsPerUnit})}</p>}
          {activity.restrictions.maxWeightKg !== undefined && <p className="request-review-restriction">{t("maxWeight")}: {activity.restrictions.maxWeightKg} {t("kg")}</p>}
          <p className="request-line-price">{p("subtotal")}: {money(estimate.items[index]?.amount ?? null)}</p>
        </div></article>;
      })}</section>
      {draft.notes && <section className="request-section"><h2>{t("notesTitle")}</h2><p className="request-review-notes">{draft.notes}</p></section>}
      <div className="request-total"><span>{p("total")}</span><strong>{money(estimate.amount)}</strong><p>{p("managerNotice")}</p></div>
      {failure && <p role="alert" className="request-errors">{failure}</p>}
      <div className="request-actions"><button type="button" disabled={busy} className="request-edit" onClick={edit}>← {t("edit")}</button><button type="button" disabled={busy} aria-busy={busy} onClick={submit} className={buttonVariants({variant: "primary", size: "lg"})}>{busy ? t("sending") : t("send")} <span aria-hidden="true">→</span></button></div>
      <p className="request-disclaimer">{t("requestNotice")}</p>
    </div>}
  </div>;
}
