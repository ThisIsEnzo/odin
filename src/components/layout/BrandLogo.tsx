import { cn } from "@/lib/utils";

/** Official photographic artwork with its wall removed in the source SVG relief filter. */
export function BrandLogo({ full = false, className }: { full?: boolean; className?: string }) {
  return <span className={cn(full ? "ground-logo-full" : "ground-logo", className)}>
    <img src="/images/brand/on-ground-wordmark-relief.webp"
      alt="ON GROUND — KHAO MAI KAEO" width={1206} height={375} decoding="async" />
  </span>;
}
