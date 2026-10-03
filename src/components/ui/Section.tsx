import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "canvas" | "canvas-soft" | "moss";

const tones: Record<SectionTone, string> = {
  canvas: "bg-canvas",
  "canvas-soft": "bg-canvas-soft",
  moss: "bg-moss text-canvas",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
}

/** Generic vertical rhythm for page sections. Page-specific layout stays in the page, not here. */
export function Section({ tone = "canvas", className, ...props }: SectionProps) {
  return <section className={cn("site-section", tones[tone], className)} {...props} />;
}
