import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";


export function WhyOdin() {
  const t = useTranslations("whyOdin");

  return (
    <Section tone="canvas">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <Reveal variant="left">
          <div>
            <p className="eyebrow mb-4 text-brand-primary">
              {t("kicker")}
            </p>
            <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              {t("heading")}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-ink/75">{t("lead")}</p>
            <p className="mt-4 text-sm text-ink/60">
              {t("distanceNote", { distance: siteConfig.locationDistanceFromPattaya })}
            </p>
          </div>
        </Reveal>

        <Reveal variant="right" delayMs={80}>
          <div className="grid gap-8">
            <div className="border-t border-ink/20 pt-5">
              <h3 className="font-display text-2xl text-ink"><span aria-hidden="true" className="mr-4 text-xs text-brand-primary">01</span>{t("pillarRide.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarRide.description")}</p>
            </div>
            <div className="border-t border-ink/20 pt-5">
              <h3 className="font-display text-2xl text-ink"><span aria-hidden="true" className="mr-4 text-xs text-brand-primary">02</span>{t("pillarRest.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarRest.description")}</p>
            </div>
            <div className="border-t border-ink/20 pt-5">
              <h3 className="font-display text-2xl text-ink"><span aria-hidden="true" className="mr-4 text-xs text-brand-primary">03</span>{t("pillarTable.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarTable.description")}</p>
            </div>
          </div>
        </Reveal>
      </Container>

      
      <Container className="mt-12">
        <p className="border-t border-ink/15 pt-6 text-sm text-ink/60">
          {t("experienceCount", { count: experiences.length })}
        </p>
      </Container>
    </Section>
  );
}
