import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card bg-white/60 border border-moss/15",
        "shadow-sm shadow-ink/5",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-display text-xl text-ink", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-2 text-ink/70 leading-relaxed", className)} {...props} />;
}

/**
 * Footer row for a Card — used to hold data-driven meta (hours, restriction,
 * price badges) below the title/description. Kept as a thin wrapper rather
 * than a new file elsewhere, per PHASE 3A's file-count constraint.
 */
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-5 flex flex-wrap items-center gap-2 border-t border-moss/10 pt-4", className)}
      {...props}
    />
  );
}
