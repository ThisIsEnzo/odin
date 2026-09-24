"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { primaryNavItems, bookNowItem } from "@/lib/nav-items";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, {passive:true});
    return () => window.removeEventListener("scroll", update);
  }, []);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <header className={`sticky top-0 z-30 border-b border-ink/10 bg-canvas/95 backdrop-blur ${scrolled ? "shadow-sm" : ""}`}>
      <Container className={`flex items-center justify-between gap-4 transition-[min-height] duration-300 ${scrolled ? "min-h-20" : "min-h-24 lg:min-h-[104px]"}`}>
        
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-2xl tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Image
            src="/images/brand/odin-logo.jpg"
            alt=""
            width={1387}
            height={1536}
            className="brand-lockup"
          />
          <span className="sr-only">ODIN — {tCommon("logoSuffix")}</span>
        </Link>

        <nav
          aria-label={tCommon("primaryNavigation")}
          className="hidden items-center gap-1 xl:flex"
        >
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-transparent px-3 py-3 text-sm font-medium text-ink/80 hover:border-terracotta hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              {t(item.translationKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden xl:inline-flex" />
          <Link
            href={bookNowItem.href}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            {t(bookNowItem.translationKey)}
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
