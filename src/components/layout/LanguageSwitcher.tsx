"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
  // Chromium treats native selects as focus-visible even after a pointer click.
  // Keep the keyboard indicator while avoiding a persistent pointer focus box.
  const [pointerFocus, setPointerFocus] = useState(false);

  return (
    <label className={cn("language-control inline-flex items-center text-sm", className)}>
      <span className="sr-only">{t("languageSwitcherLabel")}</span>
      <select
        value={locale}
        data-pointer-focus={pointerFocus || undefined}
        onPointerDown={() => setPointerFocus(true)}
        onKeyDown={() => setPointerFocus(false)}
        onBlur={() => setPointerFocus(false)}
        onChange={(event) => {
          const nextLocale = event.target.value as (typeof routing.locales)[number];
          router.replace(pathname, { locale: nextLocale });
        }}
        className="language-select"
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="language-chevron" />
    </label>
  );
}
