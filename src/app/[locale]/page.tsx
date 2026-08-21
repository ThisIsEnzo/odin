import { setRequestLocale, getTranslations, getFormatter } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { experiences } from "@/data/odin/experiences";
import { siteConfig } from "@/data/odin/site";
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

// Purely visual accent cycling for the experience cards — not tied to any
// business fact, just a way to keep four cards from reading as identical
// gray boxes. Reuses the existing brand tokens from globals.css.
const cardAccents = ["border-t-moss", "border-t-saddle", "border-t-dusk"] as const;

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tExperiences = await getTranslations("experiences");
  const tExperienceCard = await getTranslations("experienceCard");
  const tPricing = await getTranslations("pricing");
  const tNav = await getTranslations("nav");
  const format = await getFormatter();

  return (
    <>
      {/* HERO — PHASE 3A */}
      <Section tone="canvas" className="relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28">
        {/* Restrained golden-hour backdrop — a static gradient, not imagery or motion. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-dusk-light)_0%,_transparent_60%)] opacity-25"
        />

        <Container className="max-w-3xl text-center">
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
        </Container>
      </Section>

      {/* EXPERIENCES — data-driven from src/data/odin/experiences.ts only */}
      <Section tone="canvas-soft">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("experiencesHeading")}
            </h2>
            <p className="mt-2 text-ink/70">{t("experiencesIntro")}</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((experience, index) => {
              const maxWeight = experience.restrictions.maxWeightKg;
              const accent = cardAccents[index % cardAccents.length];

              return (
                <Card key={experience.id} className={cn("flex flex-col border-t-4", accent)}>
                  <CardBody className="flex flex-1 flex-col">
                    <CardTitle>
                      {tExperiences(`${toCamelCase(experience.id)}.title`)}
                    </CardTitle>
                    <CardDescription>
                      {tExperiences(`${toCamelCase(experience.id)}.shortDescription`)}
                    </CardDescription>

                    <CardFooter className="mt-auto flex-col items-start gap-3">
                      <Badge variant="outline">
                        {tExperienceCard("hours", {
                          open: experience.operatingHours.open,
                          close: experience.operatingHours.close,
                        })}
                      </Badge>

                      {maxWeight ? (
                        <Badge variant="saddle">
                          {tExperienceCard("maxWeight", { max: maxWeight })}
                        </Badge>
                      ) : null}

                      <p className="text-sm text-ink/70">
                        {tExperienceCard("priceFrom", {
                          amount: format.number(experience.price.amount),
                          currency: experience.price.currency,
                        })}{" "}
                        <span className="text-ink/50">
                          {tPricing(`unit.${experience.price.unit}`)}
                        </span>
                      </p>
                    </CardFooter>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* PHASE 3B — sections below compose homepage/* components, each
          reading its own data-layer import. Hero and Experiences above are
          untouched from Phase 3A. */}
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

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
