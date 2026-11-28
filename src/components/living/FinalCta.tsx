"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandSeal } from "@/components/layout/BrandSeal";

export function FinalCta() {
  const t = useTranslations("finalCta");
  const home = useTranslations("home");

  return (
    <section className="le-close le-grain" aria-labelledby="le-close-title">
      <div className="le-wrap le-close-inner">
        <div className="le-close-copy">
          <span className="le-close-seal" aria-hidden="true"><BrandSeal /></span>
          <p className="le-note le-note-light">{home("heroKicker")}</p>
          <h2 id="le-close-title" className="le-display">{t("heading")}</h2>
          <p>{t("body")}</p>
          <div className="le-close-actions">
            <Link href="/book" className="le-cta le-cta-light">{t("primaryCta")} <span aria-hidden="true">↗</span></Link>
            <Link href="/#experiences" className="le-link">{t("secondaryCta")}</Link>
          </div>
        </div>
        <div className="le-close-signature" aria-hidden="true">
          <BrandSeal />
          <span>ON GROUND · KHAO MAI KAEO</span>
        </div>
      </div>
    </section>
  );
}
