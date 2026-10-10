import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { restaurant } from "@/data/odin/restaurant";

export function Restaurant() {
  const t = useTranslations(restaurant.translationNamespace);

  return (
    <Section id="restaurant" tone="moss" className="surface-inverse !py-0">
      <div className="restaurant-feature">
        <Reveal className="restaurant-photo">
          <Image
            src="/images/restaurant/odin-restaurant.jpg"
            alt={t("title")}
            fill
            sizes="(min-width: 1440px) 864px, (min-width: 1024px) 60vw, 100vw"
            className="object-cover object-[center_55%]"
          />
        </Reveal>
        <Reveal className="restaurant-panel" delayMs={80}>
          <div className="restaurant-copy">
            <p className="eyebrow mb-5 text-brand-cream">ON GROUND · {t("title")}</p>
            <h2 className="font-display text-canvas">{t("title")}</h2>
            <p className="mt-5 max-w-md text-canvas/80">{t("description")}</p>
            <dl className="mt-7 border-y border-canvas/20 py-5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                <dt className="text-canvas/70">{t("hoursLabel")}</dt>
                <dd className="font-medium tabular-nums text-canvas">
                  {restaurant.operatingHours.open}–{restaurant.operatingHours.close}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm text-canvas/65">{t("menuComingSoon")}</p>
            <Link href="/book" className={buttonVariants({ variant: "inverse", size: "md", className: "mt-7 w-full sm:w-auto" })}>
              {t("cta")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
