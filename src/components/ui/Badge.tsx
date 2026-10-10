import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "moss" | "saddle" | "dusk" | "terracotta" | "outline";

const variants: Record<BadgeVariant, string> = {
  moss: "bg-surface-dark text-canvas",
  saddle: "bg-error text-canvas",
  dusk: "bg-brand-cream text-ink",
  // PHASE 4 FINALIZATION — new brand accent (see globals.css). Additive
  // only: existing variants/usages are unchanged, this is available for a
  // future "featured"/selected badge use, not applied anywhere by default.
  terracotta: "bg-brand-primary text-canvas",
  outline: "border border-ink/20 text-ink/80 bg-transparent",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "outline", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
