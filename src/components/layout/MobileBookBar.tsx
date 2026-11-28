"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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

    const hero =
      document.querySelector<HTMLElement>(".le-hero") ??
      document.querySelector<HTMLElement>(".arrival") ??
      document.querySelector<HTMLElement>(".estate-hero") ??
      document.querySelector<HTMLElement>(".homepage .hero");

    const update = () => {
      setShown(hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 560);
    };

    update();
    window.addEventListener("resize", update, { passive: true });

    if (hero && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(() => update(), { threshold: 0 });
      observer.observe(hero);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", update);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [onBookRoute, pathname]);

  if (onBookRoute) return null;

  return (
    <div
      aria-hidden={!shown}
      className={cn("mobile-book-bar fixed inset-x-0 bottom-0 z-40 sm:hidden", shown && "is-visible")}
    >
      {shown ? (
        <Link
          href="/book"
          className="mobile-book-bar-link flex min-h-14 items-center justify-center gap-2 px-6 text-sm font-medium"
        >
          {t("bookNow")}
          <span aria-hidden="true">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
