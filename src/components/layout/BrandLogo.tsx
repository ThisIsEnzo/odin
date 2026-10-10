import { cn } from "@/lib/utils";

/** Actual client artwork, cropped without altering its lettering or proportions. */
export function BrandLogo({ full = false, className }: { full?: boolean; className?: string }) {
  return <span className={cn(full ? "ground-logo-full" : "ground-logo", className)}>
    <img src="/images/brand/on-ground-title-relief.svg"
      alt="ON GROUND CAFE & FARM — KHAO MAI KAEO" width={1270} height={400} />
  </span>;
}
