"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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

  return (
    <div className="text-center">
      <Badge variant="moss" className="mb-4">
        {t("success.badge")}
      </Badge>
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("success.title")}</h2>
      <p className="mx-auto mt-3 max-w-md text-ink/75">{t("success.body")}</p>
      <p className="mt-4 text-sm text-ink/50">{t("success.reference", { id: bookingId })}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          {t("success.backHome")}
        </Link>
        <Link href="/experiences" className={buttonVariants({ variant: "outline" })}>
          {t("success.viewExperiences")}
        </Link>
      </div>
    </div>
  );
}
