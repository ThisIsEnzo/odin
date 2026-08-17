import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    // Required in next-intl v4 — omitting this silently breaks locale
    // resolution even when proxy.ts is set up correctly.
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
