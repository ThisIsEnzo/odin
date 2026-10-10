"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import type { BookingItem, ExperienceId } from "@/types/domain";
import { buttonVariants } from "@/components/ui/Button";
import { OfferFacts } from "./OfferFacts";

const photos: Record<ExperienceId, string> = {
  "horse-riding": "odin-horse.jpg", "pony-riding": "odin-pony.jpg", atv: "odin-atv.jpg", sauna: "odin-sauna.jpg",
};

export function ExperiencePicker({items, onActivity, onPackage, onEdit}: {
  items: BookingItem[];
  onActivity: (id: ExperienceId) => void;
  onPackage: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const t = useTranslations("booking"), all = useTranslations();
  function actions(matches: BookingItem[], add: () => void, name: string) {
    return <div className="discovery-actions">
      {matches.length > 0 && <p className="discovery-added"><span aria-hidden="true">✓</span> {t("ux.addedCount", {count: matches.length})}</p>}
      <button type="button" className={buttonVariants({variant: matches.length ? "outline" : "primary", size: "sm"})} aria-label={`${matches.length ? t("v2.edit") : t("ux.add")}: ${name}`} onClick={() => matches[0] ? onEdit(matches[0].id) : add()}>
        {matches.length ? t("ux.editInVisit") : t("ux.add")}<span aria-hidden="true">{matches.length ? "↗" : "+"}</span>
      </button>
      {matches.length > 0 && <button type="button" className="visit-quiet-action" onClick={add} aria-label={`${t("ux.addAgain")}: ${name}`}>{t("ux.addAgain")}</button>}
    </div>;
  }
  return <div className="experience-picker">
    <div className="discovery-list">
      {experiences.map(e => {
        const matches = items.filter(i => i.type === "activity" && i.experienceId === e.id);
        const included = items.some(i => i.type === "package" && i.components.some(a => a.experienceId === e.id));
        const name = all(`${e.translationNamespace}.title`);
        return <article className={`discovery-row ${matches.length ? "is-added" : ""}`} key={e.id}>
          <div className="discovery-photo"><Image src={`/images/experiences/${photos[e.id]}`} alt="" loading={e.id === "horse-riding" ? "eager" : "lazy"} fill sizes="(min-width: 640px) 152px, 100px" className="object-cover" /></div>
          <div className="discovery-copy">
            <p className="visit-kind">{t("ux.experience")}</p>
            <h3>{name}</h3>
            <p>{all(`${e.translationNamespace}.shortDescription`)}</p>
            <p className="discovery-meta">{t("v2.hours", e.operatingHours)}{e.requiresWeight && <> · {t("ux.maxWeight", { max: e.restrictions.maxWeightKg ?? "" })}</>}</p>
            <OfferFacts experience={e}/>
            {included && <p className="discovery-included">{t("ux.inPackage")}</p>}
            {actions(matches, () => onActivity(e.id), name)}
          </div>
        </article>;
      })}
    </div>
    <section className="discovery-packages" aria-labelledby="visit-packages-title">
      <p className="eyebrow text-brand-primary">{t("ux.together")}</p>
      <h3 id="visit-packages-title">{t("v2.packages")}</h3>
      <p className="text-sm text-text-secondary mt-3">{t("v2.packageNotice")}</p>
      {packages.map(p => {
        const matches = items.filter(i => i.type === "package" && i.packageId === p.id);
        const name = all(`${p.translationNamespace}.title`);
        return <article key={p.id} className={`discovery-package ${matches.length ? "is-added" : ""}`}>
          <div><p className="visit-kind">{t("ux.package")}</p><h4>{name}</h4>
            <p className="mt-2 text-sm text-text-secondary">{t("ux.includes")}: {p.includedExperienceIds.map(id => all(`${experiences.find(e => e.id === id)!.translationNamespace}.title`)).join(" · ")}{p.includesRestaurant ? ` · ${t("v2.restaurant")}` : ""}</p>
          </div>
          <OfferFacts pack={p}/>
          {actions(matches, () => onPackage(p.id), name)}
        </article>;
      })}
    </section>
  </div>;
}
