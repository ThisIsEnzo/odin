import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed middleware.ts -> proxy.ts (the exported default is
 * still the function next-intl's createMiddleware returns — nothing about
 * next-intl's own API changed, only the file Next.js looks for). Do not
 * rename this back to middleware.ts: Next.js 16 treats that name as
 * deprecated and next-intl's locale negotiation silently stops running.
 */
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals, and files with an
  // extension (images, favicon, etc.) — those don't need a locale prefix.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
