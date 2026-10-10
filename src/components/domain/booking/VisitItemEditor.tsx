"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { ActivityBookingItem, BookingItem, Locale } from "@/types/domain";
import type { FieldErrorEntry } from "@/lib/validation/booking.schema";
import { activitiesOf } from "@/lib/booking/itinerary";
import { ActivityEditor } from "./ActivityEditor";
import { BookingOptions } from "./BookingOptions";
import { DurationText } from "./Estimate";
import { visitDate } from "./VisitSummary";

export function VisitItemEditor({ item, index, locale, nameOf, onActivity, onOptions, error, errors }: {
  item: BookingItem;
  index: number;
  locale: Locale;
  nameOf: (a: ActivityBookingItem) => string;
  onActivity: (a: ActivityBookingItem) => void;
  onOptions: (options: BookingItem["options"]) => void;
  error: (path: string) => string | undefined;
  errors: Record<string, FieldErrorEntry>;
}) {
  const t = useTranslations("booking");
  const activities = activitiesOf(item);
  const [active, setActive] = useState(activities[0]?.id);
  useEffect(() => {
    const prefix = `items.${index}.components.`;
    const invalid = Object.keys(errors).find(key => key.startsWith(prefix));
    if (invalid && item.type === "package") {
      const component = item.components[Number(invalid.slice(prefix.length).split(".")[0])];
      if (component) setActive(component.id);
    }
  }, [errors, index, item]);
  const selected = activities.find(a => a.id === active) ?? activities[0];
  return <>
    {item.type === "package" && <div className="package-activity-list">
      {activities.map(a => <div key={a.id} className={selected?.id === a.id ? "is-active" : ""}>
        <button type="button" className="package-activity-choice" aria-expanded={selected?.id === a.id} aria-controls={`component-${a.id}`} onClick={() => setActive(a.id)}>
          <span>{nameOf(a)}</span><small>{selected?.id === a.id ? t("ux.editing") : t("v2.edit")}</small>
        </button>
        {selected?.id !== a.id && <p className="visit-summary-detail">{a.date ? visitDate(a.date, locale) : t("v2.datePending")} · {t("fields.time")}: {a.time || t("v2.timePending")} · {t("pricing.duration")}: <DurationText minutes={a.durationMinutes}/> · {t("v2.guestCount", { count: a.participants.length })}</p>}
        <div id={`component-${a.id}`} hidden={selected?.id !== a.id}>
          {selected?.id === a.id && <><ActivityEditor included activity={a} path={`items.${index}.components.${activities.indexOf(a)}`} onChange={onActivity} error={error}/><BookingOptions item={a} onChange={options => onActivity({ ...a, options })}/></>}
        </div>
      </div>)}
    </div>}
    {item.type === "activity" && <><ActivityEditor activity={item} path={`items.${index}`} onChange={onActivity} error={error}/><BookingOptions item={item} onChange={options => onActivity({ ...item, options })}/></>}
    {item.type === "package" && <BookingOptions item={item} onChange={onOptions}/>}
  </>;
}
