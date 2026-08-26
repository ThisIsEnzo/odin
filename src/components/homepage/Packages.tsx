import { useFormatter, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { packages } from "@/data/odin/packages";
import type { Package } from "@/types/domain";

/**
 * Verified against docs/odin_phase3_reconcile_reference.md: `packages` is
 * the correct named export from src/data/odin/packages.ts, and every field
 * accessed below (id, translationNamespace, includedExperienceIds,
 * includesRestaurant, price.{amount,currency,unit}, mock.isMock) matches
 * the real Package/Money/MockFlag shapes in src/types/domain.ts exactly.
 *
 * CINEMATIC MOTION REFINEMENT: stagger updated to this phase's explicit
 * spec (0ms / 100ms / 200ms per card), capped at 300ms total regardless of
 * how many packages exist later. Cards also get a restrained hover lift
 * (translateY -4px + a touch more shadow, transform/box-shadow only — no
 * dimension change) — hover naturally does nothing on touch devices, so
 * mobile isn't relying on it for anything.
 */
export function Packages() {
  const t = useTranslations("packages");

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <Section tone="canvas-soft">
      <Container>
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("heading")}</h2>
            <p className="mt-2 text-ink/70">{t("intro")}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <Reveal key={pkg.id} className="h-full" delayMs={Math.min(index * 100, 300)}>
              <PackageCard pkg={pkg} />
            </Reveal>
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
    <Card className="flex h-full flex-col transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
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
