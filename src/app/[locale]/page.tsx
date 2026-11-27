import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { experiences } from "@/data/odin/experiences";
import { Reveal } from "@/components/motion/Reveal";
import { ChapterHeading } from "@/components/ui/ChapterHeading";
import { HeroSlideshow } from "@/components/homepage/HeroSlideshow";
import { ExperienceShowcase } from "@/components/homepage/ExperienceShowcase";
import { WhyOdin } from "@/components/homepage/WhyOdin";
import { Packages } from "@/components/homepage/Packages";
import { Restaurant } from "@/components/homepage/Restaurant";
import { Gallery } from "@/components/homepage/Gallery";
import { ReviewsLocation } from "@/components/homepage/ReviewsLocation";
import { Faq } from "@/components/homepage/Faq";
import { FinalCta } from "@/components/homepage/FinalCta";
import { siteConfig } from "@/data/odin/site";
import { VisitBrief } from "@/components/homepage/VisitBrief";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const location = await getTranslations("location");

  return (
    <div className="homepage">
      <section className="hero estate-hero">
        <div className="estate-hero-panel">
          <p className="eyebrow estate-hero-kicker">{t("heroKicker")}</p>
          <h1 className="estate-hero-title">{t("heroTitle")}</h1>
          <p className="estate-hero-sub">{t("heroSubtitle")}</p>
          <div className="estate-hero-actions">
            <Link href="/book" className={buttonVariants({ size: "lg" })}>
              {nav("bookNow")} <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/#experiences" className="estate-hero-secondary">
              {t("secondaryCta")}
            </Link>
          </div>
          <p className="estate-hero-note">{t("heroNote")}</p>
          <p className="estate-hero-place">
            {location("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}
          </p>
        </div>

        <div className="estate-hero-media">
          <HeroSlideshow
            images={["/images/hero/odin-hero.jpg", "/images/hero/odin-hero-2.jpg", "/images/hero/odin-hero-3.jpg"]}
            className="absolute inset-0 overflow-hidden"
          />
          <div className="estate-hero-caption" aria-hidden="true">
            <span>ON GROUND</span>
            <span>CHON BURI · THAILAND</span>
          </div>
        </div>
      </section>

      <VisitBrief />

      <Section id="experiences" className="lg:py-28">
        <Container>
          <Reveal>
            <ChapterHeading
              index="01"
              variant="split"
              title={t("experiencesHeading")}
              intro={t("experiencesIntro")}
              className="mb-12"
            />
          </Reveal>
          <ExperienceShowcase experiences={experiences} />
        </Container>
      </Section>

      <WhyOdin />
      <Packages />
      <Restaurant />
      <Gallery />
      <ReviewsLocation />
      <Faq />
      <FinalCta />
    </div>
  );
}
