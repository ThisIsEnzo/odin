import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { experiences } from "@/data/odin/experiences";
import { siteConfig } from "@/data/odin/site";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ExperienceShowcase } from "@/components/homepage/ExperienceShowcase";
import { WhyOdin } from "@/components/homepage/WhyOdin";
import { Packages } from "@/components/homepage/Packages";
import { Restaurant } from "@/components/homepage/Restaurant";
import { Gallery } from "@/components/homepage/Gallery";
import { ReviewsLocation } from "@/components/homepage/ReviewsLocation";
import { Faq } from "@/components/homepage/Faq";
import { FinalCta } from "@/components/homepage/FinalCta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  return (
    <>
      {/* HERO — PHASE 3D: odin-hero.jpg replaces the Phase 3C gradient.
          Same parallax wrapper, same text/CTA structure as before. The
          content sits in a frosted canvas-colored card over the photo
          (rather than recoloring the existing dark-ink text) so contrast
          holds regardless of what's behind it, and a soft top/bottom scrim
          keeps the badge/stats row readable at the card's edges. */}
      <Section tone="canvas" className="relative isolate overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28">
        <Parallax strength={40} className="absolute inset-0 -z-10">
          {/* Presentation/concept photography — see PHASE 3D brief; not
              represented anywhere as real ODIN photography. Decorative
              (alt=""): the text card carries all the actual information. */}
          <Image
            src="/images/hero/odin-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_55%] sm:object-[65%_50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/0 to-ink/30" />
        </Parallax>

        <Reveal>
          <Container className="max-w-3xl text-center">
            <div className="rounded-card bg-canvas/90 px-6 py-8 shadow-lg shadow-ink/10 backdrop-blur-sm sm:px-10 sm:py-10">
              <Badge variant="dusk" className="mb-6">
                {t("heroKicker")}
              </Badge>

              <h1 className="text-balance font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
                {t("heroTitle")}
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg text-ink/75 sm:text-xl">
                {t("heroSubtitle")}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  {tNav("bookNow")}
                </Link>
                <Link
                  href="/experiences"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  {t("secondaryCta")}
                </Link>
              </div>

              <p className="mt-6 text-sm text-ink/60">{t("heroNote")}</p>

              <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-ink/10 pt-8 text-sm">
                <div>
                  <dt className="sr-only">{t("statDistanceLabel")}</dt>
                  <dd className="font-medium text-ink/80">
                    {t("statDistance", { distance: siteConfig.locationDistanceFromPattaya })}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{t("statExperiencesLabel")}</dt>
                  <dd className="font-medium text-ink/80">
                    {t("statExperiences", { count: experiences.length })}
                  </dd>
                </div>
              </dl>
            </div>
          </Container>
        </Reveal>
      </Section>

      {/* EXPERIENCES — PHASE 3C §2: one dominant, selectable content area
          instead of a static grid. Still reads only from
          src/data/odin/experiences.ts, passed as a prop below. */}
      <Section tone="canvas-soft">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("experiencesHeading")}
            </h2>
            <p className="mt-2 text-ink/70">{t("experiencesIntro")}</p>
          </Reveal>

          <Reveal className="mt-10" delayMs={100}>
            <ExperienceShowcase experiences={experiences} />
          </Reveal>
        </Container>
      </Section>

      {/* PHASE 3B/3C — sections below compose homepage/* components, each
          reading its own data-layer import. */}
      <WhyOdin />
      <Packages />
      <Restaurant />
      <Gallery />
      <ReviewsLocation />
      <Faq />
      <FinalCta />
    </>
  );
}
