"use client";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
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
    <header className={`ground-header brand-material sticky top-0 z-30 border-b border-brand-cream/20 ${scrolled ? "is-scrolled" : ""}`}>
      <Container className={`flex items-center justify-between gap-3 transition-[min-height] duration-300 ${scrolled ? "min-h-16" : "min-h-20 lg:min-h-22"}`}>
        <Link
          href="/"
          className="ground-brand-zone flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cream"
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label={tCommon("primaryNavigation")}
          className="hidden items-center gap-0 lg:flex"
        >
          {primaryNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="ground-nav-link">
              {t(item.translationKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden lg:inline-flex" />
          <Link
            href={bookNowItem.href}
            className={buttonVariants({ variant: "primary", size: "sm", className: "ground-header-cta" })}
          >
            {t(bookNowItem.translationKey)}
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
