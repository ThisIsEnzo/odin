"use client";

import { useTranslations } from "next-intl";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import type { ExperienceId } from "@/types/domain";
import { cn } from "@/lib/utils";

export interface ExperienceStepProps {
  selectedId: ExperienceId | null;
  contextPackageId: string | null;
  onSelect: (id: ExperienceId) => void;
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function ExperienceStep({ selectedId, contextPackageId, onSelect }: ExperienceStepProps) {
  const t = useTranslations("booking");
  const tExperiences = useTranslations("experiences");
  const tPackages = useTranslations("packages");

  const contextPackage = contextPackageId ? packages.find((p) => p.id === contextPackageId) : null;

  return (
    <div>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{t("steps.experience")}</h2>

      {contextPackage && (
        <p className="mt-3 rounded-card border border-brand-cream/30 bg-brand-cream/10 p-4 text-sm text-ink/80">
          {t("packageContext", { packageName: tPackages(`${toCamelCase(contextPackage.id)}.title`) })}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {experiences.map((experience) => {
          const isSelected = experience.id === selectedId;
          const namespace = toCamelCase(experience.id);
          return (
            <button
              key={experience.id}
              type="button"
              onClick={() => onSelect(experience.id)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-card border p-5 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
                isSelected
                  ? "border-surface-dark bg-surface-dark/10"
                  : "border-surface-dark/15 bg-white/60 hover:border-surface-dark/40",
              )}
            >
              <span className="font-display text-lg text-ink">{tExperiences(`${namespace}.title`)}</span>
              <span className="mt-1 block text-sm text-ink/70">
                {tExperiences(`${namespace}.shortDescription`)}
              </span>
              <span className="mt-3 block text-xs text-ink/50">
                {experience.operatingHours.open}–{experience.operatingHours.close}
              </span>
              {isSelected && (
                <span className="mt-3 inline-block text-xs font-semibold text-surface-dark">
                  {t("actions.selected")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
