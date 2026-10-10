import { cn } from "@/lib/utils";

/** Actual client artwork, cropped without altering its lettering or proportions. */
export function BrandLogo({ full = false, className }: { full?: boolean; className?: string }) {
  return <span className={cn(full ? "ground-logo-full" : "ground-logo", className)}>
    <picture>
      <source srcSet="/images/brand/on-ground-wordmark.webp" type="image/webp" />
      <img src="/images/brand/on-ground-wordmark.png"
        alt="ON GROUND CAFE & FARM — KHAO MAI KAEO" width={1270} height={400} decoding="async" />
    </picture>
  </span>;
}
