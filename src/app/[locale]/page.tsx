import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { experiences } from "@/data/odin/experiences";
import { Reveal } from "@/components/motion/Reveal";
import { ChapterHeading } from "@/components/ui/ChapterHeading";
import { HeroArrival } from "@/components/homepage/HeroArrival";
import { ExperienceShowcase } from "@/components/homepage/ExperienceShowcase";
import { WhyOdin } from "@/components/homepage/WhyOdin";
import { Packages } from "@/components/homepage/Packages";
import { Restaurant } from "@/components/homepage/Restaurant";
import { Gallery } from "@/components/homepage/Gallery";
import { ReviewsLocation } from "@/components/homepage/ReviewsLocation";
import { Faq } from "@/components/homepage/Faq";
import { FinalCta } from "@/components/homepage/FinalCta";
import { VisitBrief } from "@/components/homepage/VisitBrief";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="homepage">
      <HeroArrival />

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
