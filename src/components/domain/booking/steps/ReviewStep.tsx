"use client";

import { useTranslations } from "next-intl";
import type { Experience } from "@/types/domain";
import { packages } from "@/data/odin/packages";

export interface ReviewStepProps {
  experience: Experience;
  contextPackageId: string | null;
  date: string;
  time: string;
  guests: string;
  weightKg: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Deliberately does NOT show a price. There's no existing approved UI
 * precedent for displaying price to a visitor anywhere in the current
 * project (the homepage doesn't show it either), and every price in
 * src/data/odin is explicitly flagged MOCK per MOCK_DATA.md §3 — showing an
 * unconfirmed number on a request form risks it being read as real pricing.
 * Revisit once a genuine pricing display decision is made elsewhere first.
 */
export function ReviewStep({
  experience,
  contextPackageId,
  date,
  time,
  guests,
  weightKg,
  name,
  email,
  phone,
  notes,
}: ReviewStepProps) {
  const t = useTranslations("booking");
  const tExperiences = useTranslations("experiences");
  const tPackages = useTranslations("packages");

  const experienceName = tExperiences(`${toCamelCase(experience.id)}.title`);
  const contextPackage = contextPackageId ? packages.find((p) => p.id === contextPackageId) : null;

  const rows: { label: string; value: string }[] = [
    {
      label: t("review.experience"),
      value: contextPackage
        ? `${experienceName} (${tPackages(`${toCamelCase(contextPackage.id)}.title`)})`
        : experienceName,
    },
    { label: t("review.date"), value: date },
    { label: t("review.time"), value: time },
    { label: t("review.guests"), value: guests },
  ];

  if (experience.requiresWeight && weightKg) {
    rows.push({ label: t("review.weight"), value: `${weightKg} kg` });
  }

  rows.push({ label: t("review.name"), value: name });
  rows.push({ label: t("review.contact"), value: `${email} · ${phone}` });

  if (notes.trim()) {
    rows.push({ label: t("review.notes"), value: notes });
  }

  return (
    <div>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{t("steps.review")}</h2>

      <dl className="mt-6 divide-y divide-ink/10 rounded-card border border-moss/15 bg-white/60">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-sm font-medium text-ink/60">{row.label}</dt>
            <dd className="text-sm text-ink sm:text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm text-ink/70">{t("review.disclaimer")}</p>
    </div>
  );
}
