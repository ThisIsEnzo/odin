import { useTranslations } from "next-intl";
import { siteConfig } from "@/data/odin/site";

export function Location() {
  const t = useTranslations("location");

  return (
    <section id="location" className="le-find" aria-labelledby="le-location-title">
      <div className="le-wrap le-find-grid">
        <div className="le-find-copy">
          <p className="le-note">{t("heading")}</p>
          <h2 id="le-location-title" className="le-display">{t("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}</h2>
          <p className="le-body">{t("body")}</p>
          <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="le-link le-directions">
            {t("openInMaps")} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="le-map">
          <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="le-map-fallback">
            {t("openInMaps")} <span aria-hidden="true">↗</span>
          </a>
          <iframe
            src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s2612557755843089553"
            title={`${t("heading")} — ON GROUND, Khao Mai Kaeo`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
