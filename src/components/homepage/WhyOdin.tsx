import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ChapterHeading } from "@/components/ui/ChapterHeading";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";

const pillars = ["pillarRide", "pillarRest", "pillarTable"] as const;

/** 02 — The place: an asymmetric photo-led story with a practical narrative. */
export function WhyOdin() {
  const t = useTranslations("whyOdin");

  return (
    <Section tone="canvas" className="story-section">
      <Container className="story-grid">
        <Reveal variant="mask" className="story-photo">
          <Parallax strength={26} scale={0.06} className="absolute inset-0">
            <Image
              src="/images/gallery/odin-gallery-01.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover object-[center_60%]"
            />
          </Parallax>
        </Reveal>

        <div className="story-copy">
          <Reveal>
            <ChapterHeading
              index="02"
              variant="stack"
              kicker={t("kicker")}
              title={t("heading")}
            />
          </Reveal>

          <Reveal delayMs={80}>
            <p className="story-lead">{t("lead")}</p>
            <p className="story-distance">
              {t("distanceNote", { distance: siteConfig.locationDistanceFromPattaya })}
            </p>
          </Reveal>

          <div className="story-pillars">
            {pillars.map((key, index) => (
              <Reveal
                key={key}
                delayMs={120 + index * 70}
                className="story-pillar"
              >
                <span aria-hidden="true" className="story-pillar-index">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="story-pillar-title">{t(`${key}.title`)}</h3>
                  <p className="story-pillar-text">{t(`${key}.description`)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="story-count">
            {t("experienceCount", { count: experiences.length })}
          </p>
        </div>
      </Container>
    </Section>
  );
}
