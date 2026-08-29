import Image from "next/image";
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
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-canvas/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        {/* PHASE 4 FINAL — real logo asset (public/images/brand/odin-logo-icon.jpg),
            a lossless crop of the supplied artwork's horse/rider mark — not
            redrawn in CSS. Sized as a compact badge, not the full rectangular
            lockup, so it reads as an emblem rather than a slab of color; the
            text wordmark stays real, legible text (same element as before,
            just paired with the mark) rather than being replaced by an image. */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-2xl tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Image
            src="/images/brand/odin-logo-icon.jpg"
            alt=""
            width={57}
            height={40}
            className="rounded-md shadow-sm shadow-ink/10 ring-1 ring-terracotta/25"
          />
          <span>
            ODIN
            <span className="sr-only"> — {tCommon("logoSuffix")}</span>
          </span>
        </Link>

        <nav
          aria-label={tCommon("primaryNavigation")}
          className="hidden items-center gap-1 md:flex"
        >
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-button px-3 py-2 text-sm font-medium text-ink/80 hover:bg-moss/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
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
