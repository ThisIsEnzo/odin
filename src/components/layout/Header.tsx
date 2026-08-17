import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { primaryNavItems, bookNowItem } from "@/lib/nav-items";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <header className="sticky top-0 z-30 border-b border-[--color-ink]/10 bg-[--color-canvas]/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="font-[--font-display] text-2xl tracking-tight text-[--color-ink] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-moss]"
        >
          ODIN
          <span className="sr-only"> — {tCommon("logoSuffix")}</span>
        </Link>

        <nav
          aria-label={tCommon("primaryNavigation")}
          className="hidden items-center gap-1 md:flex"
        >
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[--radius-button] px-3 py-2 text-sm font-medium text-[--color-ink]/80 hover:bg-[--color-moss]/10 hover:text-[--color-ink] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-moss]"
            >
              {t(item.translationKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <Link
            href={bookNowItem.href}
            className={buttonVariants({ variant: "primary", size: "sm", className: "hidden md:inline-flex" })}
          >
            {t(bookNowItem.translationKey)}
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
