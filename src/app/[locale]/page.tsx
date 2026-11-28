import { setRequestLocale } from "next-intl/server";
import { experiences } from "@/data/odin/experiences";
import { Hero } from "@/components/living/Hero";
import { Statement } from "@/components/living/Statement";
import { PlanVisit } from "@/components/living/PlanVisit";
import { Experiences } from "@/components/living/Experiences";
import { Story } from "@/components/living/Story";
import { Packages } from "@/components/living/Packages";
import { Restaurant } from "@/components/living/Restaurant";
import { Gallery } from "@/components/living/Gallery";
import { GuestStories } from "@/components/living/GuestStories";
import { Location } from "@/components/living/Location";
import { Faq } from "@/components/living/Faq";
import { FinalCta } from "@/components/living/FinalCta";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="homepage">
      <Hero />
      <Statement />
      <PlanVisit />
      <Experiences items={experiences} />
      <Story />
      <Packages />
      <Restaurant />
      <Gallery />
      <GuestStories />
      <Location />
      <Faq />
      <FinalCta />
    </div>
  );
}
