import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { experiences } from "@/data/odin/experiences";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * PLACEHOLDER homepage — proves the foundation (i18n, data layer, UI
 * primitives) works end to end. This is intentionally not the full
 * 10-section homepage from CLAUDE.md §20 (Hero, Experiences, Why ODIN,
 * Packages, Restaurant, Gallery, Reviews, Location, FAQ, Final CTA) — that
 * build-out is explicitly out of scope for this phase.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tExperiences = await getTranslations({ locale, namespace: "experiences" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <Section tone="canvas" className="pt-20 sm:pt-28">
        <Container className="max-w-3xl text-center">
          <Badge variant="dusk" className="mb-6">
            {t("badge")}
          </Badge>
          <h1 className="font-[--font-display] text-4xl leading-tight text-[--color-ink] sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-[--color-ink]/75">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {tNav("bookNow")}
            </Link>
            <Link href="/experiences" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("secondaryCta")}
            </Link>
          </div>
        </Container>
      </Section>

      <Section tone="canvas-soft">
        <Container>
          <h2 className="font-[--font-display] text-2xl text-[--color-ink] sm:text-3xl">
            {t("experiencesHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-[--color-ink]/70">{t("experiencesIntro")}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((experience) => (
              <Card key={experience.id}>
                <CardBody>
                  <CardTitle>{tExperiences(`${toCamelCase(experience.id)}.title`)}</CardTitle>
                  <CardDescription>
                    {tExperiences(`${toCamelCase(experience.id)}.shortDescription`)}
                  </CardDescription>
                  <p className="mt-4 text-sm text-[--color-ink]/60">
                    {experience.operatingHours.open}–{experience.operatingHours.close}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
