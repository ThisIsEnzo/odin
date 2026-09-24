import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { restaurant } from "@/data/odin/restaurant";


export function Restaurant() {
  const t = useTranslations(restaurant.translationNamespace);
  const tRestaurant = useTranslations("restaurant");

  return (
    <Section id="restaurant" tone="moss" className="!py-0">
      <Container className="!max-w-none !px-0">
        <div className="relative">
          
          <Reveal variant="left" className="relative h-[360px] overflow-hidden sm:h-[520px] lg:h-[650px]">
            <Parallax strength={26} className="absolute -inset-6">
              <Image
                src="/images/restaurant/odin-restaurant.jpg"
                alt={t("title")}
                fill
                sizes="100vw"
                className="object-cover object-[center_55%]"
              />
            </Parallax>
          </Reveal>

          
          <Reveal
            variant="right"
            delayMs={150}
            className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          >
            <div className="relative -mt-16 max-w-3xl bg-moss px-6 py-12 sm:px-12 sm:py-16">
              <Badge variant="outline" className="mb-6 border-canvas/30 text-canvas">
                {tRestaurant("title")}
              </Badge>
              <h2 className="font-display text-3xl leading-tight text-canvas sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-4 max-w-lg text-canvas/80">{t("description")}</p>

              <dl className="mt-6 flex flex-col gap-3 text-sm text-canvas/75">
                <div className="flex items-center gap-2">
                  <dt className="font-medium text-canvas">{tRestaurant("hoursLabel")}</dt>
                  <dd>
                    {restaurant.operatingHours.open}–{restaurant.operatingHours.close}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="font-medium text-canvas">{tRestaurant("avgSpendLabel")}</dt>
                  <dd>
                    {restaurant.averageSpend.min}–{restaurant.averageSpend.max}{" "}
                    {restaurant.averageSpend.currency}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-canvas/65">{tRestaurant("menuComingSoon")}</p>

              <Link
                href="/book"
                className={buttonVariants({ variant: "primary", size: "md", className: "mt-6" })}
              >
                {tRestaurant("cta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
