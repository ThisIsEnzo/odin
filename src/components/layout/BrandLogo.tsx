import { cn } from "@/lib/utils";

/** Actual client artwork, cropped without altering its lettering or proportions. */
export function BrandLogo({ full = false, className }: { full?: boolean; className?: string }) {
  return <span className={cn(full ? "ground-logo-full" : "ground-logo", className)}>
    <img src="/images/brand/on-ground-khao-mai-kaeo-wordmark.webp"
      alt="ON GROUND CAFE & FARM — KHAO MAI KAEO" width={1224} height={390} />
  </span>;
}
