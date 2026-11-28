"use client";

import { useTranslations } from "next-intl";
import { siteConfig } from "@/data/odin/site";
import { restaurant } from "@/data/odin/restaurant";
import { bookableExperiences } from "@/data/odin/experiences";

export function PlanVisit() {
  const t = useTranslations();

  const facts = [
    {
      label: t("home.statDistanceLabel"),
      value: t("location.distanceBadge", { distance: siteConfig.locationDistanceFromPattaya }),
    },
    {
      label: t("restaurant.title"),
      value: `${t("restaurant.hoursLabel")} · ${restaurant.operatingHours.open}–${restaurant.operatingHours.close}`,
    },
    {
      label: t("home.statExperiencesLabel"),
      value: t("home.statExperiences", { count: bookableExperiences().length }),
    },
  ];

  return (
    <section className="le-plan" aria-labelledby="le-plan-title">
      <div className="le-wrap le-plan-inner">
        <div className="le-plan-intro">
          <p className="le-note">{t("restaurant.cta")}</p>
          <h2 id="le-plan-title" className="le-display le-plan-title">{t("location.heading")}</h2>
          <p className="le-body le-plan-copy">{t("location.body")}</p>
          <div className="le-plan-actions">
            <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="le-link">
              {t("location.openInMaps")} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <dl className="le-plan-facts">
          {facts.map((fact) => (
            <div className="le-plan-fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
