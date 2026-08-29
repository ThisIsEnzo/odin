"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface CustomerStepProps {
  name: string;
  email: string;
  phone: string;
  notes: string;
  company: string; // honeypot — always empty for real visitors
  onChange: (field: "name" | "email" | "phone" | "notes" | "company", value: string) => void;
  fieldErrorText?: (field: "name" | "email" | "phone") => string | undefined;
}

export function CustomerStep({
  name,
  email,
  phone,
  notes,
  company,
  onChange,
  fieldErrorText,
}: CustomerStepProps) {
  const t = useTranslations("booking");
  const nameError = fieldErrorText?.("name");
  const emailError = fieldErrorText?.("email");
  const phoneError = fieldErrorText?.("phone");

  return (
    <div>
      <h2 className="font-display text-xl text-ink sm:text-2xl">{t("steps.details")}</h2>

      <div className="mt-6 grid gap-6">
        <div>
          <label htmlFor="booking-name" className="block text-sm font-medium text-ink">
            {t("fields.name")}
          </label>
          <input
            id="booking-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "booking-name-error" : undefined}
            className={cn(
              "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
              nameError ? "border-saddle" : "border-ink/20",
            )}
          />
          {nameError && (
            <p id="booking-name-error" role="alert" className="mt-1.5 text-sm text-saddle">
              {nameError}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="booking-email" className="block text-sm font-medium text-ink">
              {t("fields.email")}
            </label>
            <input
              id="booking-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "booking-email-error" : undefined}
              className={cn(
                "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
                emailError ? "border-saddle" : "border-ink/20",
              )}
            />
            {emailError && (
              <p id="booking-email-error" role="alert" className="mt-1.5 text-sm text-saddle">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="booking-phone" className="block text-sm font-medium text-ink">
              {t("fields.phone")}
            </label>
            <input
              id="booking-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? "booking-phone-error" : undefined}
              className={cn(
                "mt-2 w-full rounded-button border bg-transparent px-3 py-2.5 text-ink",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
                phoneError ? "border-saddle" : "border-ink/20",
              )}
            />
            {phoneError && (
              <p id="booking-phone-error" role="alert" className="mt-1.5 text-sm text-saddle">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="booking-notes" className="block text-sm font-medium text-ink">
            {t("fields.notes")}
          </label>
          <textarea
            id="booking-notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className={cn(
              "mt-2 w-full rounded-button border border-ink/20 bg-transparent px-3 py-2.5 text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
            )}
          />
        </div>

        {/* Honeypot — invisible to real visitors, per BOOKING_RULES.md §6.
            Not `type="hidden"` (some bots skip those); visually hidden
            instead, and pulled out of tab order / screen-reader flow. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="booking-company">Company</label>
          <input
            id="booking-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => onChange("company", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
