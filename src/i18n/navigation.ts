import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware drop-in replacements for next/link and next/navigation.
 * Always import Link/redirect/usePathname/useRouter from here — never from
 * "next/link" or "next/navigation" directly — so locale prefixes are
 * handled automatically instead of by hand in every component.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
