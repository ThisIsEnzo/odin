import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

  // Array-shaped on purpose so this reads as "the current hero slide set,"
  // not a one-off — but only one approved photo actually exists at
  // public/images/hero/ right now (verified on disk, not assumed). A real
  // crossfade slideshow needs 2+ images to cross-fade BETWEEN; with one
  // photo there's nothing to transition to, so this renders as a single
  // slide with the slow continuous zoom (`.hero-photo` in globals.css)
  // standing in for "cinematic photography" until more photos exist. The
  // carousel progress indicator below only renders once this array has 2+
  // entries, so no dead/non-functional dots are shown for a single image.
  const heroImages = ["/images/hero/odin-hero.jpg"];

  return (
    <>
      {/* HERO — CINEMATIC MOTION REFINEMENT: the content panel is now a
          STABLE surface (bg/border/blur/shadow) rendered at full opacity
          from the first frame — it never fades in as a block. Only the
          content INSIDE it (badge → headline → copy → CTAs → trust line)
          gets one subtle, one-time entrance (opacity + translateY), which
          is what was actually meant by "the beige panel feels like it's
          appearing" — the fix is architectural (split surface from
          content), not a matter of easing/timing. */}
      <Section tone="canvas" className="relative isolate overflow-hidden py-0">
        <div className="relative h-[76vh] min-h-[560px] sm:h-[80vh] lg:h-[88vh]">
          <Parallax strength={36} className="absolute inset-0 -z-10">
            {/* Presentation/concept photography — see PHASE 3D brief; not
                represented anywhere as real ODIN photography. Decorative
                (alt=""): the panel carries all the actual information. */}
            <Image
              src={heroImages[0]}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-photo object-cover object-[75%_55%] sm:object-[65%_50%]"
            />
            {/* Stable overlay — a fixed gradient, never itself animated. */}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/5 to-ink/35" />
          </Parallax>

          <div className="absolute inset-0 flex items-center justify-center px-4">
            {/* The surface: present at full opacity immediately, no fade. */}
            <div className="mx-auto max-w-2xl rounded-card border border-white/25 bg-canvas/80 px-6 py-8 text-center shadow-xl shadow-ink/15 backdrop-blur-lg sm:px-10 sm:py-10">
              {/* Only the content fades/lifts in — once, on first view. */}
              <Reveal>
                <Badge variant="dusk" className="mb-5">
                  {t("heroKicker")}
                </Badge>

                <h1 className="text-balance font-display text-4xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
                  {t("heroTitle")}
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-base text-ink/75 sm:text-xl">
                  {t("heroSubtitle")}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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

                <p className="mt-5 text-sm text-ink/60">{t("heroNote")}</p>

                <dl className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-ink/10 pt-5 text-sm">
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
              </Reveal>
            </div>
          </div>

          {heroImages.length > 1 ? (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 text-xs tracking-wide text-canvas/85"
            >
              {/* Carousel progress — intentionally not rendered: only one
                  approved hero photo currently exists (see heroImages
                  above), so there is nothing to page between yet. */}
            </div>
          ) : null}
        </div>
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

          <Reveal className="mt-10" delayMs={60}>
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
