import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Consistent horizontal rhythm — every page composes sections inside this, never a bespoke max-width. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
