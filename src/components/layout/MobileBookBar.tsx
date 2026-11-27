"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Keeps the booking action reachable on small screens after the homepage hero.
 * The header CTA is intentionally hidden below 640px, so this restores a
 * persistent primary action without changing the booking request flow.
 */
export function MobileBookBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const onBookRoute = pathname === "/book" || pathname.startsWith("/book/");

  useEffect(() => {
    if (onBookRoute) {
      setShown(false);
      return;
    }

    const hero = document.querySelector<HTMLElement>(".homepage .hero");
    const update = () => {
      const shouldShow = hero
        ? hero.getBoundingClientRect().bottom <= 0
        : window.scrollY > 560;
      setShown(shouldShow);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [onBookRoute]);

  if (onBookRoute) return null;

  return (
    <div
      aria-hidden={!shown}
      className={cn(
        "mobile-book-bar fixed inset-x-0 bottom-0 z-40 sm:hidden",
        shown ? "is-visible" : "",
      )}
    >
      <Link
        href="/book"
        tabIndex={shown ? 0 : -1}
        className="mobile-book-bar-link flex min-h-14 items-center justify-center gap-2 px-6 text-sm font-medium"
      >
        {t("bookNow")}
        <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
