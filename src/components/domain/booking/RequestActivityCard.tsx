"use client";
import {useRef} from "react";
import Image from "next/image";
import {useTranslations} from "next-intl";
import type {BookingActivitySelection, Experience} from "@/types/domain";
import {createSelection, MAX_REQUEST_GUESTS, unitBounds, withGuestCount} from "@/lib/booking/request";

export function CountControl({id, label, value, min, max, context, onChange}: {
  id: string; label: string; value: number; min: number; max: number; context: string; onChange: (value: number) => void;
}) {
  const t = useTranslations("booking.v3");
  return <div className="request-count"><span id={`${id}-label`}>{label}</span>
    <div role="group" aria-labelledby={`${id}-label`}>
      <button type="button" disabled={value <= min} aria-label={t("decrease", {label, name: context})} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite" aria-label={`${label}: ${context}`}>{value}</output>
      <button type="button" disabled={value >= max} aria-label={t("increase", {label, name: context})} onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>;
}
export function RequestActivityCard({activity, selection, onChange, error, price}: {
  activity: Experience; selection?: BookingActivitySelection; onChange: (value?: BookingActivitySelection) => void;
  error: (field: string) => string | undefined; price: string;
}) {
  const all = useTranslations(), t = useTranslations("booking.v3"), p = useTranslations("booking.pricing");
  const addButton = useRef<HTMLButtonElement>(null);
  const name = all(`${activity.translationNamespace}.title`), prefix = `activity-${activity.id}`;
  const packages = useTranslations("booking.packages");
  const capacity = activity.booking?.model === "capacity_unit" ? activity.booking : undefined;
  const bounds = selection && capacity ? unitBounds(selection.guestCount, capacity.maxGuestsPerUnit) : undefined;
  const tiers = activity.durationOptions ?? [];
  return <article id={prefix} tabIndex={-1} aria-labelledby={`${prefix}-title`} data-activity={activity.id} className={`request-activity ${selection ? "is-included" : ""}`}>
    <div className="request-photo"><Image src={activity.bookingImage ?? "/images/gallery/placeholder.svg"} alt={name} fill sizes="(min-width: 1024px) 480px, 100vw"/>
      {selection && <span className="request-included"><span aria-hidden="true">✓</span> {t("included")}</span>}
    </div>
    <div className="request-card-body">
      <h3 id={`${prefix}-title`}>{name}</h3><p className="request-description">{all(`${activity.translationNamespace}.shortDescription`)}</p>
      {activity.restrictions.maxWeightKg !== undefined && <div className="request-restriction"><span>{t("maxWeight")}</span><strong>{activity.restrictions.maxWeightKg} <span>{t("kg")}</span></strong></div>}
      {selection && <div className="request-configuration">
        <div className="request-counts"><CountControl id={`${prefix}-guests`} label={t("guests")} value={selection.guestCount} min={1} max={MAX_REQUEST_GUESTS} context={name}
          onChange={guestCount => onChange(withGuestCount(selection, guestCount, activity))}/>
          {capacity && bounds && <CountControl id={`${prefix}-units`} label={all(capacity.unitTranslationKey)} value={selection.unitCount ?? bounds.min} min={bounds.min} max={bounds.max} context={name}
            onChange={unitCount => onChange({...selection, unitCount})}/>}
        </div>
        {capacity && <p className="request-capacity">{t("capacitySummary", {guests: selection.guestCount, units: selection.unitCount ?? 1, label: all(capacity.unitTranslationKey)})}<br/>{t("capacityHelp", {max: capacity.maxGuestsPerUnit})}{capacity.maxGuestsPerUnit===2 && <><br/>{packages("shared")}: {selection!.guestCount-(selection!.unitCount??1)} · {packages("solo")}: {2*(selection!.unitCount??1)-selection!.guestCount}</>}</p>}
        <fieldset className="request-durations" aria-describedby={error("durationMinutes") ? `${prefix}-duration-error` : undefined}><legend>{p("duration")}</legend>
          {tiers.length ? <div>{tiers.map(tier => <button key={tier.durationMinutes} type="button" aria-pressed={selection.durationMinutes === tier.durationMinutes}
            onClick={() => onChange({...selection, durationMinutes: tier.durationMinutes})}>{p("minutes", {count: tier.durationMinutes})}</button>)}</div> : <p className="request-pending">{p("pending")}</p>}
        </fieldset>
        {["activityId", "guestCount", "durationMinutes", "unitCount"].map(field => error(field) && <p id={`${prefix}-${field === "durationMinutes" ? "duration" : field}-error`} className="request-field-error" key={field}>{error(field)}</p>)}
      </div>}
      <div className="request-card-bottom"><div><span>{p("subtotal")}</span><p>{price}</p></div>
        {selection ? <button type="button" className="request-remove" aria-label={`${t("remove")}: ${name}`} onClick={() => {onChange(); requestAnimationFrame(() => addButton.current?.focus());}}>{t("remove")}</button>
          : <button type="button" ref={addButton} className="request-add" aria-label={`${t("add")}: ${name}`} onClick={() => onChange(createSelection(activity))}><span aria-hidden="true">+</span> {t("add")}</button>}
      </div>
    </div>
  </article>;
}
