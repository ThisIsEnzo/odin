import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { experiences } from "@/data/odin/experiences";
import { Reveal } from "@/components/motion/Reveal";
import { HeroSlideshow } from "@/components/homepage/HeroSlideshow";
import { ExperienceShowcase } from "@/components/homepage/ExperienceShowcase";
import { WhyOdin } from "@/components/homepage/WhyOdin";
import { Packages } from "@/components/homepage/Packages";
import { Restaurant } from "@/components/homepage/Restaurant";
import { Gallery } from "@/components/homepage/Gallery";
import { ReviewsLocation } from "@/components/homepage/ReviewsLocation";
import { Faq } from "@/components/homepage/Faq";
import { FinalCta } from "@/components/homepage/FinalCta";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  return <div className="homepage">
    <section className="surface-inverse relative isolate bg-surface-dark text-white">
      <HeroSlideshow images={["/images/hero/odin-hero.jpg", "/images/hero/odin-hero-2.jpg", "/images/hero/odin-hero-3.jpg"]} className="absolute inset-0 overflow-hidden" />
      <div className="hero-shade pointer-events-none absolute inset-0" />
      <Container className="hero-content relative flex min-h-[700px] flex-col justify-center pb-28 pt-20 sm:min-h-[760px] lg:min-h-[min(850px,calc(100svh-96px))]">
        <p className="eyebrow mb-6 text-white/85">{t("heroKicker")}</p>
        <h1 className="hero-title">{t("heroTitle")}</h1>
        <p className="mt-6 max-w-md text-base text-white/85 sm:text-lg">{t("heroSubtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link href="/book" className={buttonVariants({size:"lg"})}>{nav("bookNow")} <span aria-hidden="true">↗</span></Link>
          <Link href="/#experiences" className="border-b border-white/50 py-3 text-sm hover:border-white">{t("secondaryCta")}</Link>
        </div>
        <p className="mt-6 max-w-md text-xs text-white/75">{t("heroNote")}</p>
      </Container>
    </section>
    <Section id="experiences" className="lg:py-28">
      <Container>
        <Reveal className="mb-12 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <h2>{t("experiencesHeading")}</h2>
          <p className="max-w-md text-ink/70 lg:justify-self-end">{t("experiencesIntro")}</p>
        </Reveal>
        <ExperienceShowcase experiences={experiences}/>
      </Container>
    </Section>
    <WhyOdin/><Packages/><Restaurant/><Gallery/><ReviewsLocation/><Faq/><FinalCta/>
  </div>;
}
