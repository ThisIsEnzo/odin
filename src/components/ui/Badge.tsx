import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "moss" | "saddle" | "dusk" | "outline";

const variants: Record<BadgeVariant, string> = {
  moss: "bg-moss text-canvas",
  saddle: "bg-saddle text-canvas",
  dusk: "bg-dusk text-ink",
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
