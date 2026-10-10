"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export interface RequestReceivedProps {
  bookingId: string;
}

/**
 * BOOKING_RULES.md §1/§8 — request-to-book, not instant reservation. This
 * screen must never say "confirmed"/"guaranteed"; it only ever reports what
 * the API actually returned: status "received".
 */
export function RequestReceived({ bookingId }: RequestReceivedProps) {
  const t = useTranslations("booking");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <div className="booking-surface mx-auto max-w-2xl py-12 text-center">
      <p className="eyebrow text-brand-primary mb-6">
        {t("success.badge")}
      </p>
      <h1 ref={heading} tabIndex={-1}>{t("success.title")}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink/75">{t("success.body")}</p>
      <p className="mt-8 border-y border-ink/15 py-5 break-all text-sm text-ink/75">{t("success.reference", { id: bookingId })}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          {t("success.backHome")}
        </Link>
        <Link href="/#experiences" className={buttonVariants({ variant: "outline" })}>
          {t("success.viewExperiences")}
        </Link>
      </div>
    </div>
  );
}
