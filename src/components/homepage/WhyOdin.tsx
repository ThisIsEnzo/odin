import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";

const pillars = ["pillarRide", "pillarRest", "pillarTable"] as const;

/** 02 — A more immersive, layered expression of the existing place story. */
export function WhyOdin() {
  const t = useTranslations("whyOdin");

  return (
    <section className="estate-story" aria-labelledby="estate-story-title">
      <div className="estate-story-media" aria-hidden="true">
        <Parallax strength={22} scale={0.04} className="absolute inset-0">
          <Image
            src="/images/gallery/odin-gallery-04.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_55%]"
          />
        </Parallax>
      </div>

      <Container className="estate-story-inner">
        <Reveal className="estate-story-quote-wrap">
          <p className="eyebrow estate-story-kicker">{t("kicker")}</p>
          <span className="estate-story-index" aria-hidden="true">02 / THE PLACE</span>
          <h2 id="estate-story-title" className="estate-story-quote">{t("heading")}</h2>
          <p className="estate-story-lead">{t("lead")}</p>
          <p className="estate-story-distance">
            {t("distanceNote", { distance: siteConfig.locationDistanceFromPattaya })}
          </p>
        </Reveal>

        <Reveal delayMs={90} className="estate-story-notes">
          {pillars.map((key) => (
            <div key={key} className="estate-story-note">
              <span className="estate-story-note-mark" aria-hidden="true">✳</span>
              <div>
                <h3 className="estate-story-note-title">{t(key + ".title")}</h3>
                <p className="estate-story-note-text">{t(key + ".description")}</p>
              </div>
            </div>
          ))}
          <p className="estate-story-count">
            {t("experienceCount", { count: experiences.length })}
          </p>
          <div className="estate-story-inset">
            <Image
              src="/images/gallery/odin-gallery-02.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
