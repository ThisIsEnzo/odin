"use client";

import { useMemo, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { experiences } from "@/data/odin/experiences";
import type { ExperienceId, Locale } from "@/types/domain";
import { bookingSchema, collectFieldErrors, type FieldErrorEntry } from "@/lib/validation/booking.schema";
import { buttonVariants } from "@/components/ui/Button";
import { BookingStepper, type BookingStep } from "./BookingStepper";
import { ExperienceStep } from "./steps/ExperienceStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { GuestsStep } from "./steps/GuestsStep";
import { CustomerStep } from "./steps/CustomerStep";
import { ReviewStep } from "./steps/ReviewStep";
import { RequestReceived } from "./RequestReceived";

export interface BookingFlowProps {
  locale: Locale;
  initialExperienceId: ExperienceId | null;
  contextPackageId: string | null;
}

type StepIndex = 0 | 1 | 2 | 3 | 4;

interface FormState {
  step: StepIndex;
  experienceId: ExperienceId | null;
  date: string;
  time: string;
  guests: string;
  weightKg: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  company: string; // honeypot
}

type Action =
  | { type: "SELECT_EXPERIENCE"; id: ExperienceId }
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "GO_TO_STEP"; step: StepIndex };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SELECT_EXPERIENCE":
      // Clear conditional/schedule values that are specific to the previous
      // experience (BOOKING_RULES.md §9 — clear stale conditional values
      // when switching experiences).
      return { ...state, experienceId: action.id, time: "", weightKg: "" };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "GO_NEXT":
      return { ...state, step: Math.min(state.step + 1, 4) as StepIndex };
    case "GO_BACK":
      return { ...state, step: Math.max(state.step - 1, 0) as StepIndex };
    case "GO_TO_STEP":
      return { ...state, step: action.step };
    default:
      return state;
  }
}

/**
 * The Review step (4) has no inputs of its own — if a full-schema failure
 * surfaces there (a rule the lightweight per-step gate doesn't check, e.g.
 * operating-hours or interval alignment), the visitor needs to land back on
 * the step that actually owns that field, or they'd see an error with no
 * way to fix it.
 */
function stepForFieldPath(path: string): StepIndex {
  if (path === "experienceId") return 0;
  if (path === "date" || path === "time") return 1;
  if (path === "guests" || path === "weightKg") return 2;
  return 3; // customer.name / customer.email / customer.phone / company
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, FieldErrorEntry> };

export function BookingFlow({ locale, initialExperienceId, contextPackageId }: BookingFlowProps) {
  const t = useTranslations("booking");
  const tErrors = useTranslations("booking.errors");
  const tError = useTranslations("error");

  const [state, dispatch] = useReducer(formReducer, {
    step: 0,
    experienceId: initialExperienceId,
    date: "",
    time: "",
    guests: "1",
    weightKg: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
    company: "",
  });

  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  // useState alone can't reliably block a second click fired before React
  // re-renders with the disabled button — a ref is synchronous, so this is
  // the actual duplicate-submission guard; `submit.status` still drives the
  // visible disabled/aria-busy UI.
  const submittingRef = useRef(false);

  const experience = useMemo(
    () => experiences.find((e) => e.id === state.experienceId) ?? null,
    [state.experienceId],
  );

  const steps: BookingStep[] = [
    { key: "experience", label: t("steps.experience") },
    { key: "schedule", label: t("steps.schedule") },
    { key: "guests", label: t("steps.guests") },
    { key: "details", label: t("steps.details") },
    { key: "review", label: t("steps.review") },
  ];

  // Lightweight, non-duplicative per-step gating: only checks presence and
  // reads numeric bounds straight from the canonical experience object.
  // Full business-rule validation (date window, operating hours, interval
  // alignment, weight limits) happens once, via the real bookingSchema,
  // right before submission — see handleSubmit.
  function canAdvance(): boolean {
    switch (state.step) {
      case 0:
        return experience !== null;
      case 1:
        return state.date !== "" && state.time !== "";
      case 2: {
        const guestsOk = /^\d+$/.test(state.guests) && Number(state.guests) >= 1;
        if (!experience?.requiresWeight) return guestsOk;
        return guestsOk && state.weightKg !== "" && !Number.isNaN(Number(state.weightKg));
      }
      case 3:
        return state.name.trim() !== "" && /\S+@\S+\.\S+/.test(state.email) && state.phone.trim().length >= 6;
      default:
        return true;
    }
  }

  function buildPayload() {
    return {
      experienceId: state.experienceId,
      date: state.date,
      time: state.time,
      guests: Number(state.guests),
      weightKg: state.weightKg !== "" ? Number(state.weightKg) : undefined,
      customer: {
        name: state.name.trim(),
        email: state.email.trim(),
        phone: state.phone.trim(),
        notes: state.notes.trim() || undefined,
      },
      locale,
      company: state.company,
    };
  }

  // Resolves a server/client validation issue for a given field PATH (e.g.
  // "weightKg", "customer.email") into translated text via the same
  // booking.errors.* keys the schema itself emits — see fieldErrorText below.
  function errorForPath(path: string): string | undefined {
    if (submit.status !== "error" || !submit.fieldErrors) return undefined;
    const entry = submit.fieldErrors[path];
    if (!entry) return undefined;
    return tErrors(entry.key as never, entry.params as never);
  }

  const scheduleFieldError = (field: "date" | "time") => errorForPath(field);
  const guestsFieldError = (field: "guests" | "weightKg") => errorForPath(field);
  const customerFieldError = (field: "name" | "email" | "phone") =>
    errorForPath(field === "name" ? "customer.name" : field === "email" ? "customer.email" : "customer.phone");

  async function handleSubmit() {
    if (submittingRef.current) return; // synchronous guard against duplicate submits
    submittingRef.current = true;

    try {
      // Authoritative pre-submit check using the SAME schema the server uses
      // — no separate rule set. If this fails, nothing is sent, and the
      // visitor is taken back to whichever step owns the first failing
      // field so the error is actually visible and fixable.
      const parsed = bookingSchema.safeParse(buildPayload());
      if (!parsed.success) {
        const fieldErrors = collectFieldErrors(parsed.error.issues);
        const firstPath = parsed.error.issues[0]?.path.join(".") ?? "";
        setSubmit({ status: "error", fieldErrors, message: "" });
        dispatch({ type: "GO_TO_STEP", step: stepForFieldPath(firstPath) });
        return;
      }

      setSubmit({ status: "submitting" });

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.status === 201) {
        const body = (await res.json()) as { status: string; id: string };
        setSubmit({ status: "success", id: body.id });
        return;
      }

      if (res.status === 400) {
        const body = (await res.json()) as { fieldErrors?: Record<string, FieldErrorEntry> };
        setSubmit({ status: "error", fieldErrors: body.fieldErrors, message: "" });
        const firstPath = body.fieldErrors ? Object.keys(body.fieldErrors)[0] : undefined;
        if (firstPath) dispatch({ type: "GO_TO_STEP", step: stepForFieldPath(firstPath) });
        return;
      }

      // Any other status (5xx, unexpected) — generic message only, no raw
      // server detail surfaced (ARCHITECTURE.md §12).
      setSubmit({ status: "error", message: tError("description") });
    } catch {
      // Network failure — fetch itself threw.
      setSubmit({ status: "error", message: tErrors("networkFailed") });
    } finally {
      // Reset so the visitor CAN retry after a failure; success intentionally
      // unmounts the form (RequestReceived renders instead), so this is a
      // no-op in that case.
      submittingRef.current = false;
    }
  }

  if (submit.status === "success") {
    return <RequestReceived bookingId={submit.id} />;
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-moss">{t("pageTitle")}</p>
      <p className="mt-2 max-w-xl text-ink/70">{t("pageIntro")}</p>

      <div className="mt-8">
        <BookingStepper steps={steps} currentIndex={state.step} />
      </div>

      <div className="mt-8 rounded-card border border-moss/15 bg-canvas-soft/60 p-6 sm:p-8">
        {state.step === 0 && (
          <ExperienceStep
            selectedId={state.experienceId}
            contextPackageId={contextPackageId}
            onSelect={(id) => dispatch({ type: "SELECT_EXPERIENCE", id })}
          />
        )}

        {state.step === 1 && experience && (
          <ScheduleStep
            experience={experience}
            date={state.date}
            time={state.time}
            onDateChange={(value) => dispatch({ type: "SET_FIELD", field: "date", value })}
            onTimeChange={(value) => dispatch({ type: "SET_FIELD", field: "time", value })}
            fieldErrorText={scheduleFieldError}
          />
        )}

        {state.step === 2 && experience && (
          <GuestsStep
            experience={experience}
            guests={state.guests}
            weightKg={state.weightKg}
            onGuestsChange={(value) => dispatch({ type: "SET_FIELD", field: "guests", value })}
            onWeightChange={(value) => dispatch({ type: "SET_FIELD", field: "weightKg", value })}
            fieldErrorText={guestsFieldError}
          />
        )}

        {state.step === 3 && (
          <CustomerStep
            name={state.name}
            email={state.email}
            phone={state.phone}
            notes={state.notes}
            company={state.company}
            onChange={(field, value) => dispatch({ type: "SET_FIELD", field, value })}
            fieldErrorText={customerFieldError}
          />
        )}

        {state.step === 4 && experience && (
          <ReviewStep
            experience={experience}
            contextPackageId={contextPackageId}
            date={state.date}
            time={state.time}
            guests={state.guests}
            weightKg={state.weightKg}
            name={state.name}
            email={state.email}
            phone={state.phone}
            notes={state.notes}
          />
        )}

        {submit.status === "error" && submit.message && (
          <p role="alert" className="mt-4 text-sm text-saddle">
            {submit.message}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => dispatch({ type: "GO_BACK" })}
            disabled={state.step === 0 || submit.status === "submitting"}
            className={buttonVariants({ variant: "ghost", className: "disabled:invisible" })}
          >
            {t("actions.back")}
          </button>

          {state.step < 4 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "GO_NEXT" })}
              disabled={!canAdvance()}
              className={buttonVariants({ variant: "primary" })}
            >
              {t("actions.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submit.status === "submitting"}
              aria-busy={submit.status === "submitting"}
              className={buttonVariants({ variant: "primary" })}
            >
              {submit.status === "submitting" ? t("actions.submitting") : t("actions.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
