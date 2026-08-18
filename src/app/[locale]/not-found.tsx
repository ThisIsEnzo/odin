import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

/**
 * Renders for any unmatched path inside a valid locale (e.g. /en/nowhere).
 * next-intl reads the locale from the enclosing [locale] layout automatically,
 * so this needs no params/locale handling of its own.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <Section tone="canvas" className="py-24 text-center">
      <Container>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-ink/75">{t("description")}</p>
        <div className="mt-8">
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            {t("backHome")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
