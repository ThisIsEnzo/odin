"use client";

import { useTranslations } from "next-intl";
import type { Experience } from "@/types/domain";
import { getAvailableTimeSlots, todayIsoDate, maxIsoDate } from "@/lib/booking/time-slots";
import { cn } from "@/lib/utils";

export interface ScheduleStepProps {
  experience: Experience;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  fieldErrorText?: (field: "date" | "time") => string | undefined;
}

export function ScheduleStep({
  experience,
  date,
  time,
  onDateChange,
  onTimeChange,
  fieldErrorText,
}: ScheduleStepProps) {
  const t = useTranslations("booking");
  const slots = getAvailableTimeSlots(experience);
  const dateError = fieldErrorText?.("date");
  const timeError = fieldErrorText?.("time");

  return (
    <div>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{t("steps.schedule")}</h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-date" className="block text-sm font-medium text-ink">
            {t("fields.date")}
          </label>
          <input
            id="booking-date"
            type="date"
            value={date}
            min={todayIsoDate()}
            max={maxIsoDate()}
            onChange={(e) => onDateChange(e.target.value)}
            aria-invalid={dateError ? true : undefined}
            aria-describedby={dateError ? "booking-date-error" : undefined}
            className={cn(
              "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
              dateError ? "border-error" : "border-ink/20",
            )}
          />
          {dateError && (
            <p id="booking-date-error" role="alert" className="mt-1.5 text-sm text-error">
              {dateError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-time" className="block text-sm font-medium text-ink">
            {t("fields.time")}
          </label>
          <select
            id="booking-time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-invalid={timeError ? true : undefined}
            aria-describedby={timeError ? "booking-time-error" : undefined}
            className={cn(
              "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
              timeError ? "border-error" : "border-ink/20",
            )}
          >
            <option value="" disabled>
              {t("fields.timePlaceholder")}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {timeError && (
            <p id="booking-time-error" role="alert" className="mt-1.5 text-sm text-error">
              {timeError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
