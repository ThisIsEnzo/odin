import { useFormatter, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { packages } from "@/data/odin/packages";
import type { Package } from "@/types/domain";

/**
 * NOTE: `packages` is imported from the canonical data layer per
 * ARCHITECTURE.md/DATA_MODEL.md §3 (`src/data/odin/packages.ts`, `Package[]`).
 * That file was not part of the material supplied for this phase, so the
 * import name/shape here follows the documented architecture rather than an
 * inspected file — flagged in the final report for verification against the
 * real file before merge.
 */
export function Packages() {
  const t = useTranslations("packages");

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <Section tone="canvas-soft">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("heading")}</h2>
          <p className="mt-2 text-ink/70">{t("intro")}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  const t = useTranslations(pkg.translationNamespace);
  const tExperiences = useTranslations("experiences");
  const tPackages = useTranslations("packages");
  const tPricing = useTranslations("pricing");
  const format = useFormatter();

  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>

        {pkg.includedExperienceIds.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {pkg.includedExperienceIds.map((experienceId) => (
              <li key={experienceId}>
                <Badge variant="outline">
                  {tExperiences(`${toCamelCase(experienceId)}.title`)}
                </Badge>
              </li>
            ))}
            {pkg.includesRestaurant ? (
              <li>
                <Badge variant="outline">{tPackages("includesRestaurant")}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        <CardFooter className="mt-auto flex-col items-start gap-2">
          <p className="text-sm font-medium text-ink">
            {format.number(pkg.price.amount)} {pkg.price.currency}{" "}
            <span className="font-normal text-ink/50">
              {tPricing(`unit.${pkg.price.unit}`)}
            </span>
          </p>
          {pkg.mock.isMock ? (
            <p className="text-xs text-ink/50">{tPackages("mockNote")}</p>
          ) : null}
          <Link
            href="/book"
            className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-2" })}
          >
            {tPackages("cta")}
          </Link>
        </CardFooter>
      </CardBody>
    </Card>
  );
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
