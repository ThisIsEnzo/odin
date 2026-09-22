/**
 * Shared primary navigation, consumed by Header, MobileNav, and Footer so
 * the route list exists in exactly one place. `href` values are
 * locale-agnostic — always render them through the i18n-aware `Link` from
 * "@/i18n/navigation", which adds the /en, /th, /ru, /zh prefix.
 *
 * PHASE 5A FIX: five of these previously pointed at dedicated pages
 * (/experiences, /restaurant, /packages, /gallery, /location) that were
 * never built — only "/" and "/book" exist (Phase 1 only built the
 * homepage; see the Phase 1 report). Since a real, corresponding section
 * already exists on the homepage for every one of those five, each now
 * points at that section's anchor instead of a route that 404s. "faq" gets
 * the same fix, for the same reason. This is a link-target correction, not
 * a new page or a redesign — the sections themselves, and their ids, are
 * added in the components that render them (ExperienceShowcase's Section in
 * page.tsx, and Restaurant.tsx / Packages.tsx / Gallery.tsx /
 * ReviewsLocation.tsx / Faq.tsx's own root Section).
 *
 * "about" and "contact" have no equivalent homepage section to anchor to,
 * so they're left pointing at their real, still-unbuilt future routes
 * rather than being redirected to something that would misrepresent what
 * the visitor asked for — same reasoning for "privacy"/"terms" below,
 * where redirecting a legal-document link to an anchor or to /book would
 * be actively misleading, not a fix.
 */
// Bare keys, all resolved against the "nav" namespace (useTranslations("nav")) at call sites.
export const primaryNavItems = [
  { href: "/#experiences", translationKey: "experiences" },
  { href: "/#restaurant", translationKey: "restaurant" },
  { href: "/#packages", translationKey: "packages" },
  { href: "/#gallery", translationKey: "gallery" },
  { href: "/#location", translationKey: "location" },
] as const;

export const footerNavItems = [
  { href: "/about", translationKey: "about" },
  { href: "/#faq", translationKey: "faq" },
  { href: "/contact", translationKey: "contact" },
] as const;

export const legalNavItems = [
  { href: "/privacy", translationKey: "privacy" },
  { href: "/terms", translationKey: "terms" },
] as const;

export const bookNowItem = { href: "/book", translationKey: "bookNow" } as const;
