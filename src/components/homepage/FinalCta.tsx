"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BrandSeal } from "@/components/layout/BrandSeal";

export function FinalCta() {
  const t = useTranslations("finalCta");
  const home = useTranslations("home");

  return (
    <section className="estate-final">
      <Container className="estate-final-inner">
        <Reveal className="estate-final-panel">
          <span className="estate-final-seal" aria-hidden="true"><BrandSeal /></span>
          <p className="eyebrow estate-final-kicker">{home("heroKicker")}</p>
          <h2 className="estate-final-title">{t("heading")}</h2>
          <p className="estate-final-body">{t("body")}</p>
          <div className="estate-final-actions">
            <Link href="/book" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              {t("primaryCta")}
            </Link>
            <Link href="/#experiences" className="estate-final-secondary">{t("secondaryCta")}</Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
