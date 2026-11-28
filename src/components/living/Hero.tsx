"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

/** THE LIVING ESTATE — a single, authentic arrival scene with an editorial message. */
export function Hero() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");

  return (
    <section className="le-hero" aria-labelledby="le-hero-title">
      <div className="le-hero-stage">
        <div className="le-hero-media" aria-hidden="true">
          <Image
            src="/images/hero/odin-hero-2.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: "50% 60%" }}
          />
        </div>
        <div className="le-hero-scrim" aria-hidden="true" />
        <p className="le-hero-rail" aria-hidden="true">ON GROUND · KHAO MAI KAEO</p>
        <div className="le-hero-inner">
          <p className="le-note le-note-light">{t("heroKicker")}</p>
          <h1 id="le-hero-title" className="le-display le-hero-title">{t("heroTitle")}</h1>
          <p className="le-hero-sub">{t("heroSubtitle")}</p>
          <div className="le-hero-actions">
            <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {nav("bookNow")} <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/#experiences" className="le-link">{t("secondaryCta")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
