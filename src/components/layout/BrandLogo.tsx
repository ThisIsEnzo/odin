import { cn } from "@/lib/utils";

/** Cropped views of the supplied artwork; lettering is never replaced with a font. */
export function BrandLogo({ full = false, className }: { full?: boolean; className?: string }) {
  return <span role="img" aria-label="ON GROUND CAFE & FARM" className={cn(full ? "ground-logo-full" : "ground-logo", className)}>
    {full ? <img src="/images/brand/on-ground-logo-transparent.svg" alt="" width={600} height={535} /> : <>
      <img className="ground-mark" src="/images/brand/on-ground-mark-transparent.svg" alt="" width={315} height={235} />
      <img className="ground-wordmark" src="/images/brand/on-ground-wordmark-transparent.svg" alt="" width={600} height={285} />
    </>}
  </span>;
}
