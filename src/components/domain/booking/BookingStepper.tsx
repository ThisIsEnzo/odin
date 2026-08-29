import { cn } from "@/lib/utils";

export interface BookingStep {
  key: string;
  label: string;
}

export interface BookingStepperProps {
  steps: BookingStep[];
  currentIndex: number;
}

/**
 * Compact step indicator — CLAUDE.md §"Motion" asks for restraint, so this
 * is a static, no-animation progress list rather than an animated tracker.
 * Numbers here are a genuine ordered sequence (frontend-design skill's
 * caution about decorative 01/02/03 markers doesn't apply — this really is
 * a linear multi-step form), so numbering communicates real progress.
 */
export function BookingStepper({ steps, currentIndex }: BookingStepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 sm:gap-x-3" aria-label="Booking progress">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isComplete = index < currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                isCurrent && "bg-moss text-canvas",
                isComplete && !isCurrent && "bg-moss/20 text-moss",
                !isCurrent && !isComplete && "bg-ink/10 text-ink/50",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isCurrent ? "font-semibold text-ink" : "text-ink/60",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="mx-1 hidden h-px w-6 bg-ink/15 sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
