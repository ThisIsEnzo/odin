/**
 * Shared primary navigation, consumed by Header, MobileNav, and Footer so
 * the route list exists in exactly one place. `href` values are
 * locale-agnostic — always render them through the i18n-aware `Link` from
 * "@/i18n/navigation", which adds the /en, /th, /ru, /zh prefix.
 *
 * Every route below except "/" doesn't have a page built yet (Phase 1 only
 * builds the homepage) — that's expected; see the Phase 1 report.
 */
// Bare keys, all resolved against the "nav" namespace (useTranslations("nav")) at call sites.
export const primaryNavItems = [
  { href: "/experiences", translationKey: "experiences" },
  { href: "/restaurant", translationKey: "restaurant" },
  { href: "/packages", translationKey: "packages" },
  { href: "/gallery", translationKey: "gallery" },
  { href: "/location", translationKey: "location" },
] as const;

export const footerNavItems = [
  { href: "/about", translationKey: "about" },
  { href: "/faq", translationKey: "faq" },
  { href: "/contact", translationKey: "contact" },
] as const;

export const legalNavItems = [
  { href: "/privacy", translationKey: "privacy" },
  { href: "/terms", translationKey: "terms" },
] as const;

export const bookNowItem = { href: "/book", translationKey: "bookNow" } as const;
