import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[--radius-button] font-medium " +
  "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-moss]";

const variants: Record<ButtonVariant, string> = {
  // Primary = the CTA color (golden-hour amber) — reserved for the main
  // action on a screen ("Book Your Experience", "Book Now").
  primary: "bg-[--color-dusk] text-[--color-ink] hover:bg-[--color-dusk-light]",
  secondary: "bg-[--color-moss] text-[--color-canvas] hover:bg-[--color-moss-dark]",
  outline:
    "border border-[--color-moss] text-[--color-moss] bg-transparent hover:bg-[--color-moss]/10",
  ghost: "text-[--color-moss] bg-transparent hover:bg-[--color-moss]/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

/** Shared with any element that should look like a button (e.g. the i18n Link) but isn't one. */
export function buttonVariants(options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  const { variant = "primary", size = "md", className } = options ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
