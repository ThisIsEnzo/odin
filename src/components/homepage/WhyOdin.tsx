import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";

const pillars = ["pillarRide", "pillarRest", "pillarTable"] as const;

export function WhyOdin() {
  const t = useTranslations("whyOdin");
  return (
    <section className="estate-story">
      <div className="estate-story-media" aria-hidden="true">
        <Image src="/images/gallery/odin-gallery-01.jpg" alt="" fill sizes="100vw" className="object-cover object-[center_45%]" />
      </div>
      <div className="estate-story-scrim" aria-hidden="true" />
      <Container className="estate-story-inner">
        <Reveal className="estate-story-quote-wrap">
          <p className="eyebrow estate-story-kicker">{t("kicker")}</p>
          <h2 className="estate-story-quote">{t("heading")}</h2>
          <p className="estate-story-lead">{t("lead")}</p>
          <p className="estate-story-distance">{t("distanceNote", { distance: siteConfig.locationDistanceFromPattaya })}</p>
        </Reveal>
        <Reveal delayMs={90} className="estate-story-notes">
          {pillars.map((key) => (
            <div key={key} className="estate-story-note">
              <span className="estate-story-note-mark" aria-hidden="true">✳</span>
              <div>
                <h3 className="estate-story-note-title">{t(`${key}.title`)}</h3>
                <p className="estate-story-note-text">{t(`${key}.description`)}</p>
              </div>
            </div>
          ))}
          <p className="estate-story-count">{t("experienceCount", { count: experiences.length })}</p>
        </Reveal>
      </Container>
      <div className="estate-story-inset" aria-hidden="true">
        <Image src="/images/gallery/odin-gallery-02.jpg" alt="" fill sizes="(min-width:1024px) 26vw, 70vw" className="object-cover" />
      </div>
    </section>
  );
}
