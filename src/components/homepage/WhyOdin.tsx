import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { experiences } from "@/data/odin/experiences";

/**
 * "Why ODIN" — deliberately editorial rather than a 3/4-card feature grid.
 * Every claim here is derived from data already in src/data/odin (the
 * experience list + the confirmed, non-mock distance figure) — nothing
 * about age suitability, ratings, or awards is stated, since those are
 * either mock or not present in the data layer.
 *
 * CINEMATIC MOTION REFINEMENT: the two columns now use opposing motion
 * (left content slides in from the left, the pillars column from the
 * right) instead of both fading up together — "two parts of one editorial
 * composition coming together," per this phase's spec — via Reveal's
 * `variant="left"/"right"`, at the same restrained ±30px used elsewhere.
 */
export function WhyOdin() {
  const t = useTranslations("whyOdin");

  return (
    <Section tone="canvas">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
        <Reveal variant="left">
          <div>
            <Badge variant="moss" className="mb-4">
              {t("kicker")}
            </Badge>
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
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            <div className="border-l-2 border-moss/30 pl-5">
              <h3 className="font-display text-lg text-ink">{t("pillarRide.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarRide.description")}</p>
            </div>
            <div className="border-l-2 border-saddle/40 pl-5">
              <h3 className="font-display text-lg text-ink">{t("pillarRest.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarRest.description")}</p>
            </div>
            <div className="border-l-2 border-dusk/50 pl-5">
              <h3 className="font-display text-lg text-ink">{t("pillarTable.title")}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{t("pillarTable.description")}</p>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Quiet, factual reinforcement — count is read from the data layer, never hardcoded. */}
      <Container className="mt-10 border-t border-ink/10 pt-6">
        <p className="text-sm text-ink/60">
          {t("experienceCount", { count: experiences.length })}
        </p>
      </Container>
    </Section>
  );
}
