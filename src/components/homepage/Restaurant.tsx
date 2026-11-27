import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ChapterHeading } from "@/components/ui/ChapterHeading";
import { restaurant as restaurantInfo } from "@/data/odin/restaurant";

/** 04 — The table: a cinematic restaurant chapter without invented menu claims. */
export function Restaurant() {
  const t = useTranslations(restaurantInfo.translationNamespace);

  return (
    <Section id="restaurant" tone="moss" className="surface-inverse !py-0">
      <div className="restaurant-feature">
        <Reveal variant="mask" className="restaurant-photo">
          <Parallax strength={34} scale={0.07} className="absolute inset-0">
            <Image
              src="/images/restaurant/odin-restaurant.jpg"
              alt={t("title")}
              fill
              sizes="(min-width: 1440px) 864px, (min-width: 1024px) 60vw, 100vw"
              className="object-cover object-[center_55%]"
            />
          </Parallax>
        </Reveal>

        <Reveal className="restaurant-panel" delayMs={80}>
          <div className="restaurant-copy">
            <ChapterHeading
              index="04"
              variant="overlay"
              tone="cream"
              title={t("title")}
            />
            <p className="mt-5 max-w-md text-canvas/80">{t("description")}</p>
            <p className="mt-7 border-y border-canvas/20 py-5 text-sm tabular-nums text-brand-cream">
              {t("hoursLabel")} · {restaurantInfo.operatingHours.open}–{restaurantInfo.operatingHours.close}
            </p>
            <p className="mt-5 text-sm text-canvas/65">{t("menuComingSoon")}</p>
            <Link
              href="/book"
              className={buttonVariants({
                variant: "inverse",
                size: "md",
                className: "mt-7 w-full sm:w-auto",
              })}
            >
              {t("cta")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
