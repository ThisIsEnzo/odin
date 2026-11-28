import Image from "next/image";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";

const PILLARS = ["pillarRide", "pillarRest", "pillarTable"] as const;

export function Story() {
  const t = useTranslations("whyOdin");

  return (
    <section className="le-story le-grain" aria-labelledby="le-story-title">
      <div className="le-story-media" aria-hidden="true">
        <Image src="/images/gallery/odin-gallery-01.jpg" alt="" fill sizes="100vw" style={{ objectPosition: "center 42%" }} />
      </div>
      <div className="le-story-scrim" aria-hidden="true" />
      <div className="le-wrap le-story-inner">
        <div className="le-story-copy">
          <p className="le-note le-note-light">{t("kicker")}</p>
          <h2 id="le-story-title" className="le-display le-story-quote">{t("heading")}</h2>
          <p className="le-story-lead">{t("lead")}</p>
          <p className="le-story-caption">
            <span>{t("distanceNote", { distance: siteConfig.locationDistanceFromPattaya })}</span>
            <span>{t("experienceCount", { count: experiences.length })}</span>
          </p>
        </div>
        <div className="le-story-notes">
          {PILLARS.map((key) => (
            <div className="le-story-note" key={key}>
              <span className="le-story-mark" aria-hidden="true">✳</span>
              <div>
                <h3>{t(`${key}.title`)}</h3>
                <p>{t(`${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
