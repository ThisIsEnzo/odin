import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales and URL strategy.
 * localePrefix: "always" means every locale — including the default — gets
 * a URL prefix (/en/..., /th/..., /ru/..., /zh/...). See ARCHITECTURE.md §4
 * for why: unambiguous canonical URLs, trivial hreflang generation.
 */
export const routing = defineRouting({
  locales: ["en", "th", "ru", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
