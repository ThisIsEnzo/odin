"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  th: "ไทย",
  ru: "Русский",
  zh: "中文",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="sr-only">{t("languageSwitcherLabel")}</span>
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as (typeof routing.locales)[number];
          router.replace(pathname, { locale: nextLocale });
        }}
        className={cn(
          "rounded-button border border-ink/20 bg-transparent",
          "px-2 py-1.5 text-ink",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
        )}
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
