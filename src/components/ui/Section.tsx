import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "canvas" | "canvas-soft" | "moss";

const tones: Record<SectionTone, string> = {
  canvas: "bg-[--color-canvas]",
  "canvas-soft": "bg-[--color-canvas-soft]",
  moss: "bg-[--color-moss] text-[--color-canvas]",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
}

/** Generic vertical rhythm for page sections. Page-specific layout stays in the page, not here. */
export function Section({ tone = "canvas", className, ...props }: SectionProps) {
  return <section className={cn("py-16 sm:py-24", tones[tone], className)} {...props} />;
}
