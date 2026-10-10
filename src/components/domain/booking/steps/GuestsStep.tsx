"use client";

import { useTranslations } from "next-intl";
import type { Experience } from "@/types/domain";
import { cn } from "@/lib/utils";

export interface GuestsStepProps {
  experience: Experience;
  guests: string;
  weightKg: string;
  onGuestsChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  fieldErrorText?: (field: "guests" | "weightKg") => string | undefined;
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function GuestsStep({
  experience,
  guests,
  weightKg,
  onGuestsChange,
  onWeightChange,
  fieldErrorText,
}: GuestsStepProps) {
  const t = useTranslations("booking");
  const tExperiences = useTranslations("experiences");
  const guestsError = fieldErrorText?.("guests");
  const weightError = fieldErrorText?.("weightKg");

  const { minWeightKg, maxWeightKg } = experience.restrictions;
  const experienceName = tExperiences(`${toCamelCase(experience.id)}.title`);

  return (
    <div>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{t("steps.guests")}</h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-guests" className="block text-sm font-medium text-ink">
            {t("fields.guests")}
          </label>
          <input
            id="booking-guests"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={guests}
            onChange={(e) => onGuestsChange(e.target.value)}
            aria-invalid={guestsError ? true : undefined}
            aria-describedby={guestsError ? "booking-guests-error" : undefined}
            className={cn(
              "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
              guestsError ? "border-error" : "border-ink/20",
            )}
          />
          {guestsError && (
            <p id="booking-guests-error" role="alert" className="mt-1.5 text-sm text-error">
              {guestsError}
            </p>
          )}
        </div>

        {experience.requiresWeight && (
          <div>
            <label htmlFor="booking-weight" className="block text-sm font-medium text-ink">
              {t("fields.weight")}
            </label>
            <input
              id="booking-weight"
              type="number"
              inputMode="decimal"
              min={minWeightKg ?? 1}
              max={maxWeightKg}
              value={weightKg}
              onChange={(e) => onWeightChange(e.target.value)}
              aria-invalid={weightError ? true : undefined}
              aria-describedby="booking-weight-help booking-weight-error"
              className={cn(
                "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
                weightError ? "border-error" : "border-ink/20",
              )}
            />
            <p id="booking-weight-help" className="mt-1.5 text-sm text-ink/60">
              {minWeightKg !== undefined
                ? t("fields.weightHelpRange", { min: minWeightKg, max: maxWeightKg ?? "", experience: experienceName })
                : t("fields.weightHelpMax", { max: maxWeightKg ?? "", experience: experienceName })}
            </p>
            {weightError && (
              <p id="booking-weight-error" role="alert" className="mt-1.5 text-sm text-error">
                {weightError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
