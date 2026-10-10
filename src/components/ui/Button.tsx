import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex max-w-full items-center justify-center gap-2 text-center whitespace-normal rounded-button font-medium " +
  "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark";

const variants: Record<ButtonVariant, string> = {
  // Primary = the accessible terracotta companion, reserved for the main
  // action on a screen ("Book Your Experience", "Book Now").
  primary: "bg-brand-primary text-brand-cream hover:bg-brand-primary-hover active:bg-brand-primary-active",
  inverse: "bg-brand-cream text-brand-primary hover:bg-canvas active:bg-brand-cream",
  secondary: "bg-surface-dark text-canvas hover:bg-surface-deep",
  outline: "border border-surface-dark text-surface-dark bg-transparent hover:bg-surface-dark/10",
  ghost: "text-surface-dark bg-transparent hover:bg-surface-dark/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2 text-sm",
  md: "min-h-12 px-5 py-3 text-sm",
  lg: "min-h-14 px-7 py-3 text-base",
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
