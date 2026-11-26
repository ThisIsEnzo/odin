import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "moss" | "saddle" | "dusk" | "terracotta" | "outline";

// Light, legible chips (they sit on dark photography in the showcase). Each
// variant is visually distinct while staying inside the approved brand.
const variants: Record<BadgeVariant, string> = {
  moss: "bg-canvas-soft text-ink ring-1 ring-ink/5",
  saddle: "bg-canvas text-brand-primary-active ring-1 ring-ink/5",
  dusk: "bg-brand-cream text-ink ring-1 ring-ink/5",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide shadow-sm shadow-ink/5",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
