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

/**
 * Verified against docs/odin_phase3_reconcile_reference.md: `restaurant` is
 * the correct named export from src/data/odin/restaurant.ts (also matches
 * Footer.tsx's existing usage). `translationNamespace` is "restaurant",
 * `operatingHours.{open,close}` and `averageSpend.{min,max,currency}` match
 * RestaurantInfo in src/types/domain.ts. `menu.isMock` is a literal `true`
 * in the real data, so unconditionally showing "menu coming soon" below is
 * correct rather than a bug. `cuisineTags` is `[]` in the real data, so it's
 * deliberately not rendered here.
 *
 * PHASE 3C: the previous plain two-column layout is replaced with an
 * asymmetric, overlapping composition — the content card floats onto the
 * image on desktop (negative margin) and onto its lower edge on mobile —
 * plus a restrained parallax on the image (one of the page's 2–3 parallax
 * locations per §6) and a reveal on the content card. Same data, same
 * copy, same CTA route as before.
 *
 * CINEMATIC MOTION REFINEMENT: the image now enters from the left and the
 * content card from the right (opposing motion, ~150ms apart) rather than
 * both using the same up-fade — an editorial "two halves converging" feel
 * for this specific section, via Reveal's `variant="left"/"right"`. Layout,
 * parallax, facts, and CTA are unchanged.
 */
export function Restaurant() {
  const t = useTranslations(restaurant.translationNamespace);
  const tRestaurant = useTranslations("restaurant");

  return (
    <Section id="restaurant" tone="canvas">
      <Container>
        <div className="lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Visual area — gently parallaxing photo, entering from the left. */}
          <Reveal variant="left" className="relative h-64 overflow-hidden rounded-card sm:h-80 lg:h-[26rem]">
            <Parallax strength={26} className="absolute -inset-6">
              <Image
                src="/images/restaurant/odin-restaurant.jpg"
                alt={t("title")}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[center_55%]"
              />
            </Parallax>
          </Reveal>

          {/* Overlapping content card — pulled up onto the image on mobile,
              pulled left onto the image on desktop; entering from the right,
              slightly after the image. */}
          <Reveal
            variant="right"
            delayMs={150}
            className="relative z-10 -mt-10 px-2 sm:-mt-14 sm:px-0 lg:-ml-16 lg:mt-0"
          >
            <div className="rounded-card border border-moss/15 bg-canvas p-6 shadow-sm shadow-ink/5 sm:p-8 lg:p-10">
              <Badge variant="saddle" className="mb-4">
                {tRestaurant("title")}
              </Badge>
              <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-4 max-w-lg text-ink/75">{t("description")}</p>

              <dl className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
                <div className="flex items-center gap-2">
                  <dt className="font-medium text-ink">{tRestaurant("hoursLabel")}</dt>
                  <dd>
                    {restaurant.operatingHours.open}–{restaurant.operatingHours.close}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="font-medium text-ink">{tRestaurant("avgSpendLabel")}</dt>
                  <dd>
                    {restaurant.averageSpend.min}–{restaurant.averageSpend.max}{" "}
                    {restaurant.averageSpend.currency}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-ink/50">{tRestaurant("menuComingSoon")}</p>

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
