"use client";

import { useTranslations } from "next-intl";
import { activitiesOf } from "@/lib/booking/itinerary";
import { visitSchema } from "@/lib/validation/booking.schema";
import type { ActivityBookingItem, BookingItem, Locale } from "@/types/domain";

export function visitDate(date: string, locale: Locale) {
  return date ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(new Date(`${date}T00:00:00+07:00`)) : "";
}

export function VisitSummary({items, locale, nameOf, itemName, onEdit, onAdd}: {
  items: BookingItem[];
  locale: Locale;
  nameOf: (activity: ActivityBookingItem) => string;
  itemName: (item: BookingItem) => string;
  onEdit: (id: string) => void;
  onAdd: () => void;
}) {
  const t = useTranslations("booking");
  const count = items.flatMap(activitiesOf).length;
  const pending = items.filter(item => !visitSchema.safeParse([item]).success).length;
  const content = <>
    {items.length === 0 ? <p className="visit-empty">{t("ux.empty")}</p> : <ol className="visit-summary-list">
      {items.map((item, i) => <li key={item.id}>
        <span className="visit-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          {item.type === "package" && <p className="visit-kind">{t("ux.package")}</p>}
          <button type="button" className="visit-summary-title" onClick={() => onEdit(item.id)} aria-label={`${t("v2.edit")}: ${itemName(item)}`}>{itemName(item)}</button>
          {activitiesOf(item).map(a => <div className="visit-summary-detail" key={a.id}>
            {item.type === "package" && <p>{nameOf(a)}</p>}
            <p>{a.date ? visitDate(a.date, locale) : t("v2.datePending")} · {a.time || t("v2.timePending")}</p>
            <p>{t("v2.guestCount", {count: a.participants.length})}</p>
          </div>)}
          <p className="visit-readiness">{visitSchema.safeParse([item]).success ? t("ux.ready") : t("ux.needsDetails")}</p>
        </div>
      </li>)}
    </ol>}
    <button type="button" className="visit-add-link" onClick={onAdd}><span aria-hidden="true">+</span> {t("ux.addAnother")}</button>
    <p className="visit-request-note">{t("v2.reviewNotice")}</p>
  </>;
  return <>
    <details className="visit-summary-mobile">
      <summary><span>{t("v2.title")} <span className="visit-count">{count}</span>{pending > 0 && <span className="visit-pending block">{t("ux.pending", {count: pending})}</span>}</span><span aria-hidden="true">＋</span></summary>
      <div className="visit-summary-content">{content}</div>
    </details>
    <aside className="visit-summary-desktop" aria-label={t("ux.summary")}>
      <p className="eyebrow text-terracotta">ON GROUND</p>
      <h2>{t("v2.title")}</h2>
      <p className="visit-summary-count">{t("ux.count", {count})}</p>
      {content}
    </aside>
  </>;
}
