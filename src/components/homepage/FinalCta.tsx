import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

/**
 * A plain <section> (not the shared canvas/canvas-soft Section component) so
 * the closing band can confidently use the dark moss surface without
 * depending on Section internals that weren't inspected in this phase.
 * Both links (/book, /experiences) are the same routes already used by the
 * Header, MobileNav, and the Phase 3A Hero — nothing new is introduced.
 */
export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-moss py-20 text-canvas sm:py-24">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{t("heading")}</h2>
        <p className="mt-4 text-canvas/80">{t("body")}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
            {t("primaryCta")}
          </Link>
          <Link
            href="/experiences"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "border-canvas/60 text-canvas hover:bg-canvas/10",
            })}
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
