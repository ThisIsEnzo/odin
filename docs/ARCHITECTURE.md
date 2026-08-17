# ODIN — Architecture

Status: Phase 0 (Audit & Architecture) — Draft for implementation
Owner: Lead Solution Architect
Related docs: `DATA_MODEL.md`, `BOOKING_RULES.md`, `MOCK_DATA.md`, `IMPLEMENTATION_PLAN.md`

## 1. Repository State (as of this audit)

No existing repository, `CLAUDE.md`, `package.json`, or prior scaffold was found in this
environment — the working directory and uploads folder are both empty. Everything below is
therefore a **greenfield architecture proposal**, not a description of code that already exists.

If a prior codebase for this client exists elsewhere (this brief reads as the same ranch/resort
concept as earlier scaffolding work — Next.js App Router + GSAP + multilingual SEO — done for a
Thailand-based client under a different working name), it should be supplied before Phase 1
implementation starts, so this plan can be reconciled against real code instead of duplicating it.
Nothing here is blocked on that — the plan below stands on its own — but it changes whether Phase 1
starts with `create-next-app` or with an audit of what's already there.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Current stable major as of mid‑2026 (16.2.x/16.3.x). SSR/SSG hybrid, native Metadata API, file-based routing that maps cleanly onto the required sitemap, built-in image optimization for the gallery requirement. |
| Language | **TypeScript**, strict mode | Required by brief; catches business-rule typos (e.g. wrong weight field) at compile time. |
| Runtime | **Node.js 22 LTS** | Current LTS; matches Next.js 16's baseline. |
| Styling | **Tailwind CSS v4** | CSS-first config (`@theme` in CSS, no `tailwind.config.js` needed), fast build times, easy to encode brand tokens (§15) as CSS variables. |
| UI primitives | **Radix UI primitives** (or shadcn/ui, which wraps Radix + Tailwind) for accordion, dialog/lightbox, nav menu | Accessible-by-default interaction patterns (focus trapping, keyboard nav, ARIA) are easy to get subtly wrong by hand; this satisfies §27 without reinventing it. |
| i18n | **next-intl** | Purpose-built for App Router / Server Components, typed messages, per-locale routing and formatting. More actively aligned with App Router than `next-i18next` (which only gained first-class App Router support recently). |
| Forms | **React Hook Form + Zod**, via `@hookform/resolvers/zod` | One schema drives client UX validation *and* server validation — see §6 and `BOOKING_RULES.md`. |
| API | **Next.js Route Handlers** (`app/api/**/route.ts`) | No separate backend needed for an MVP with one real write path (booking) and one optional one (contact). |
| Motion | **GSAP + `@gsap/react`**, used sparingly (scroll-triggered reveals, one signature moment) | Consistent with the direction already explored for this client if this is the same engagement; kept restrained per §18 ("avoid excessive animation"). |
| Testing | **Vitest** (unit), **React Testing Library** (component), **Playwright** (E2E smoke) | See §14. |
| Deployment (recommended, not yet decided) | **Vercel** | Native fit for Next.js image optimization, ISR, and edge/proxy config; not a hard requirement. |

Two framework-level changes are worth flagging explicitly because they'd make older tutorials
actively wrong for this project:

- **`middleware.ts` → `proxy.ts`.** Next.js 16 renamed the middleware file convention to
  `proxy.ts` (exported function is now named `proxy`, not `middleware`). We should build directly
  against `proxy.ts` from day one rather than the deprecated name.
- **Tailwind v4 is CSS-first.** Theme tokens (colors, fonts, spacing) live in an `@theme` block
  inside `globals.css`, not in a `tailwind.config.ts`. This is actually convenient for us — the
  brand palette in §15 is defined once, as CSS variables, and is trivially available to both
  Tailwind utilities and hand-written CSS.

Pin to a patched Next.js release (16.2.6+ / 16.3.x) — Vercel shipped a coordinated security release
in May 2026 covering middleware/proxy bypass, SSRF, and cache-poisoning issues; don't scaffold
against an older 16.0/16.1 tag.

## 3. Project Structure

```
src/
  app/
    [locale]/
      layout.tsx                # locale-aware shell: <html lang>, NextIntlClientProvider
      page.tsx                  # Homepage
      experiences/
        page.tsx                # Experiences overview (data-driven list)
        [slug]/
          page.tsx               # Reusable Experience Page — generateStaticParams: horse-riding, pony-riding, atv, sauna
      restaurant/page.tsx
      packages/page.tsx
      gallery/page.tsx
      about/page.tsx
      location/page.tsx
      faq/page.tsx
      contact/page.tsx
      book/page.tsx
      privacy/page.tsx
      terms/page.tsx
      not-found.tsx
    api/
      booking/route.ts          # POST — validate, persist, notify
      contact/route.ts
    sitemap.ts                  # locale-aware sitemap incl. hreflang alternates
    robots.ts
    layout.tsx                  # root layout (minimal — locale handling lives one level down)
    globals.css                 # @import "tailwindcss"; @theme { ...brand tokens... }
  i18n/
    routing.ts                  # locales, defaultLocale, localePrefix: 'always'
    navigation.ts               # createNavigation(routing) → Link, redirect, usePathname, useRouter
    request.ts                  # getRequestConfig — loads messages per locale
  proxy.ts                      # createMiddleware(routing) from next-intl — Next.js 16 convention
  data/
    odin/
      site.ts                   # SiteConfig — contact info, location, supported locales
      experiences.ts            # Experience[] — hours, restrictions, price, booking interval
      packages.ts                # Package[]
      restaurant.ts               # RestaurantInfo
      gallery.ts                  # GalleryItem[]
      faq.ts                       # FAQItem[]
      reviews.ts                   # Review[] — see MOCK_DATA.md §6, likely empty at MVP launch
  components/
    ui/                          # Button, Card, Section, Container, Badge — presentational only
    domain/                      # ExperienceCard, PackageCard, BookingForm, RestrictionsBadge, OperatingHoursBadge, GalleryLightbox, FAQAccordion, ReviewCard
    layout/                      # Header, Footer, LanguageSwitcher, MobileNav
  lib/
    validation/
      booking.schema.ts          # Zod schema(s), shared client + server
      contact.schema.ts
    analytics/
      index.ts                    # trackEvent() + provider registration
      types.ts                     # AnalyticsEvent union
    booking/
      repository.ts                 # BookingRepository interface + adapter
      notify.ts                      # NotificationService interface + adapter
    env.ts                          # Zod-validated process.env
  types/
    domain.ts                       # Experience, Package, BookingRequest, etc. — see DATA_MODEL.md
messages/
  en.json  th.json  ru.json  zh.json   # translated UI copy, namespaced to mirror src/data/odin
public/
  images/gallery/...                   # local placeholders per §23
docs/
  ARCHITECTURE.md  DATA_MODEL.md  BOOKING_RULES.md  MOCK_DATA.md  IMPLEMENTATION_PLAN.md  QA_REPORT.md
tests/
  unit/  e2e/
postcss.config.mjs
next.config.ts
tsconfig.json
package.json
.env.example
```

## 4. Routing & i18n

**URL scheme:** every locale is prefixed, including the default — `/en/...`, `/th/...`,
`/ru/...`, `/zh/...` (next-intl `localePrefix: 'always'`). This is a deliberate choice over
"unprefixed default locale": it keeps every page's canonical URL unambiguous, makes `hreflang`
alternates trivial to generate (every locale has a real, distinct URL, including English), and
avoids the classic bug where `/` and `/en` both resolve and search engines see them as duplicate
content. Locale is detected once (cookie → `Accept-Language` header → fallback to `en`) by
`proxy.ts`, then persisted via cookie so returning visitors aren't re-negotiated on every request.

**Sitemap → route mapping** (confirmed against §12 of the brief):

```
/[locale]                              → app/[locale]/page.tsx
/[locale]/experiences                  → app/[locale]/experiences/page.tsx
/[locale]/experiences/horse-riding     ┐
/[locale]/experiences/pony-riding      │→ app/[locale]/experiences/[slug]/page.tsx
/[locale]/experiences/atv              │   (generateStaticParams returns these 4 slugs — SSG)
/[locale]/experiences/sauna            ┘
/[locale]/restaurant                   → app/[locale]/restaurant/page.tsx
/[locale]/packages                     → app/[locale]/packages/page.tsx
/[locale]/gallery                      → app/[locale]/gallery/page.tsx
/[locale]/about                        → app/[locale]/about/page.tsx
/[locale]/location                     → app/[locale]/location/page.tsx
/[locale]/faq                          → app/[locale]/faq/page.tsx
/[locale]/contact                      → app/[locale]/contact/page.tsx
/[locale]/book                         → app/[locale]/book/page.tsx
/[locale]/privacy                      → app/[locale]/privacy/page.tsx
/[locale]/terms                        → app/[locale]/terms/page.tsx
```

The `[slug]` dynamic segment for experiences is how we satisfy §21 ("prefer one reusable
Experience Page") **without** deviating from the literal URLs in §12 — `generateStaticParams()`
statically renders exactly those four paths at build time, so the output is indistinguishable from
four hand-written pages, but there's one implementation to maintain.

`/packages` stays a single flat listing page (three MOCK packages, §17) — no per-package detail
routes at MVP; each package card links into `/book` with the package pre-selected via query param.

## 5. Data Layer & i18n: the "facts vs. content" split

This is the most important architectural decision in this document, because it's where §4 (i18n)
and §5/§7 (centralized, non-duplicated business data) can quietly start to conflict if not handled
deliberately.

**The problem:** "all user-facing strings must be translatable" (§4) and "do NOT hardcode prices,
hours, restrictions... inside components" (§5) are both true, but a naive combination — e.g.
storing `name: { en: '...', th: '...', ru: '...', zh: '...' }` directly on the experience object —
means a business fact like `maxWeightKg: 90` now *also* lives inside four language blobs' worth of
descriptive copy, with no single place that says "90kg" once. That's exactly the duplication §7
warns against, just moved into JSON instead of JSX.

**The resolution — two layers, one bridge:**

1. **Facts** (`src/data/odin/*.ts`) — numbers, enums, booleans: operating hours, weight/age
   limits, prices, currency, slugs, image paths, contact details. Locale-agnostic. This is the
   single source of truth business rules are validated against.
2. **Content** (`messages/{locale}.json`) — names, descriptions, marketing copy, FAQ text, UI
   labels. Managed by next-intl, namespaced to mirror the data domain (e.g.
   `experiences.horseRiding.title`, `experiences.horseRiding.description`).
3. **The bridge** — each fact object carries a `translationNamespace` (or a stable `id`), and
   components resolve both halves by that same key:

```ts
// src/data/odin/experiences.ts (facts — no strings meant for display)
export const experiences: Experience[] = [
  {
    id: 'horse-riding',
    slug: 'horse-riding',
    translationNamespace: 'experiences.horseRiding',
    operatingHours: { open: '07:00', close: '18:00' },
    restrictions: { minAge: 12, maxWeightKg: 90 },
    price: { amount: 1200, currency: 'THB', unit: 'person' },
    bookingIntervalMinutes: 60,
    requiresWeight: true,
  },
  // pony-riding, atv, sauna — see DATA_MODEL.md §4 for the full set
];
```

```tsx
// src/components/domain/ExperienceCard.tsx (content — resolved at render time)
const t = useTranslations(experience.translationNamespace);
// t('title'), t('description') — the copy; experience.price / .operatingHours — the facts
```

This means the weight limit exists in exactly one place in the codebase regardless of how many
languages ship, translators never touch numbers they could typo, and validation code (client and
server) reads restrictions straight from `src/data/odin/experiences.ts` — never from JSON that a
translator has open in an editor.

## 6. Component Architecture

Three layers, one direction of dependency (`ui` → `domain` → route `page.tsx`):

- **`components/ui/`** — dumb, reusable primitives (Button, Card, Section, Container, Badge). No
  business or translation knowledge.
- **`components/domain/`** — composed, business-aware components (`ExperienceCard`,
  `PackageCard`, `BookingForm`, `RestrictionsBadge`, `OperatingHoursBadge`, `GalleryLightbox`,
  `FAQAccordion`, `ReviewCard`). These read from `src/data/odin` and `useTranslations`.
- **`components/layout/`** — `Header`, `Footer`, `LanguageSwitcher`, `MobileNav`.
- **Route files (`app/[locale]/**/page.tsx`)** stay thin: fetch/compose data, set metadata,
  arrange domain components. No activity-specific conditionals (`if (slug === 'horse')`) ever live
  here — that's the anti-pattern §7 explicitly rules out, and the `[slug]` + facts-layer design
  in §4–5 means there's never a reason to reach for it.

## 7. Booking Architecture (summary)

Full detail, including the Zod schema and the client/server validation split, lives in
`BOOKING_RULES.md`. In short: a multi-step client component drives the UX
(`Experience → Date → Time → Guests → Conditional Requirements → Customer Info → Submit`), backed
by a `useReducer` state machine (a full state-machine library like XState isn't justified for six
linear steps — §34, avoid overengineering). One Zod schema — built dynamically from
`src/data/odin/experiences.ts` — validates on both sides: client-side via
`zodResolver` for instant feedback, server-side inside the Route Handler as the actual security
boundary. The server never trusts client-submitted hours, price, or restriction values; it only
trusts the client's *selections* (which experience, date, time, guest count, weight if
applicable, contact details) and re-derives the rules itself.

## 8. API Architecture

Two Route Handlers at MVP:

- `POST /api/booking` — validate → persist (`BookingRepository`) → notify (`NotificationService`)
  → return `{ status: 'received', id }`. Never a `confirmed` status from this endpoint — ODIN
  staff confirm manually, per §8.
- `POST /api/contact` — lighter version of the same pattern, for the general contact form.

Both are abstracted behind interfaces (see `BOOKING_RULES.md` §7) so the concrete database and
email provider are infrastructure decisions, not architecture ones — they can be chosen or
swapped without touching validation or UI code. That decision is explicitly still open (see
`IMPLEMENTATION_PLAN.md`); a local/in-memory adapter lets development proceed without it.

## 9. SEO Architecture

- Next.js Metadata API (`generateMetadata`) per route per locale, copy sourced from `messages/*`.
- `app/sitemap.ts` + `app/robots.ts` (native App Router support) — sitemap entries include
  `alternates.languages` (hreflang) for every locale of every page.
- Structured data, kept pragmatic rather than exhaustive: `LocalBusiness` (or `TouristAttraction`)
  on the homepage, `FAQPage` on `/faq`, `BreadcrumbList` on nested pages. No invented Schema.org
  type for "bookable activity" — nothing in the spec asks for rich snippets beyond what these
  three already cover, and forcing a mismatched type risks Search Console warnings.
- Canonical URL + Open Graph tags per page/locale.

## 10. Analytics Abstraction

```ts
// src/lib/analytics/types.ts
export type AnalyticsEvent =
  | { name: 'page_view'; path: string }
  | { name: 'experience_view'; experienceId: string }
  | { name: 'package_view'; packageId: string }
  | { name: 'booking_started'; experienceId: string }
  | { name: 'booking_submitted'; bookingId: string }
  | { name: 'booking_error'; reason: string }
  | { name: 'phone_clicked' } | { name: 'whatsapp_clicked' } | { name: 'line_clicked' }
  | { name: 'maps_clicked' } | { name: 'menu_viewed' }
  | { name: 'language_changed'; from: string; to: string };

// src/lib/analytics/index.ts
export interface AnalyticsProvider { track(event: AnalyticsEvent): void }
// A NoopAnalyticsProvider ships by default; swapping to GA4 / Plausible / PostHog later
// means writing one adapter, not touching any call site.
```

## 11. Accessibility

WCAG 2.1 AA, practically applied: semantic landmarks + skip-to-content link, visible
`focus-visible` rings (not suppressed), form labels + `aria-describedby` on errors, alt text
sourced from `messages/*` (never hardcoded, never omitted), Radix-based accordion/dialog/menu for
correct keyboard behavior out of the box, and a contrast check specifically on the earth-tone
palette in §15 — natural/rustic palettes are more prone to failing AA contrast than high-contrast
corporate ones, so this needs an explicit QA pass rather than an assumption.

## 12. Security

- Zod validation at the API boundary; free-text fields (booking notes) are length-limited and
  never rendered as HTML, so no sanitization-for-XSS pathway is needed at MVP scope.
- `src/lib/env.ts` parses `process.env` through a Zod schema at boot — fails fast on missing
  config instead of surfacing a confusing runtime error later. Only `NEXT_PUBLIC_`-prefixed vars
  are ever readable client-side; nothing secret gets that prefix.
- Basic rate limiting + a honeypot field on `/api/booking` and `/api/contact` (see
  `BOOKING_RULES.md` §6); Cloudflare Turnstile flagged as a fast follow-up if spam becomes real.
- Generic error responses to the client ("Something went wrong — please try again or contact us
  directly"); full error detail is logged server-side only.

## 13. Testing Strategy

- **Vitest** — `src/data/odin/*` (a regression test that asserts `maxWeightKg === 90` for
  horse-riding and `=== 60` for pony-riding, so those numbers can never drift silently) and
  `src/lib/validation/*` (over-weight rejected, out-of-hours rejected, missing conditional field
  rejected).
- **React Testing Library** — `BookingForm` step transitions; conditional weight field appears
  only for horse-riding/pony-riding.
- **Playwright** — one smoke test per locale (homepage loads, language switcher works) plus one
  full booking submission (mocked API) end to end.
- **CI gate** (Definition of Done, §35): `tsc --noEmit`, `eslint`, `vitest run`, `next build` all
  green before merge.

## 14. Design System Direction

Grounded in the actual subject — Thai countryside farmland, teak and reclaimed timber structures,
saddle leather, morning mist over paddocks, golden-hour light — rather than a generic
"rustic-premium" template. Two AI-generated-design defaults to deliberately avoid here: the
cream-background/terracotta-accent serif look, and the near-black/neon-accent look. Neither is
wrong in the abstract, but "rustic" makes it easy to drift toward the first one by default, which
would read as templated rather than considered.

**Palette** (starting proposal, to be refined visually in the design pass, not final):
- `--color-ink` `#20241F` — near-black with a green undertone, for body text (not pure black)
- `--color-canvas` `#F1EDE1` — muted oat/parchment background (deliberately greige, not stark cream)
- `--color-moss` `#3F4B3A` — deep moss green, primary brand color
- `--color-saddle` `#7A4B32` — desaturated saddle-leather brown, used sparingly as accent (chosen
  to read as tack leather, not as the generic AI terracotta)
- `--color-dusk` `#C98B4A` — golden-hour amber, secondary accent for CTAs

**Typography constraint specific to this project:** whatever characterful display face is chosen
for the hero almost certainly only covers Latin/Cyrillic glyphs — it will not have Thai or Chinese
cuts. The plan is to reserve the display face for `en`/`ru` headings and fall back to the body
humanist sans (chosen upfront for full Thai + Chinese + Latin + Cyrillic script support) for
headings in `th`/`zh`. This needs deciding before any hero component is built, not discovered
partway through — it directly shapes which typefaces are shortlisted.

**Signature element:** a subtle background-tone progression down the homepage tracking the
brief's own "Ride → Explore → Relax → Eat" arc as a golden-hour gradient — cooler, misty tones at
the top (Ride) shifting to warm dusk tones near the restaurant/final CTA (Eat). This encodes the
narrative structurally rather than decoratively, and costs nothing in "excessive animation" terms
since it's a static/scroll-linked color shift, not motion for its own sake.

**Motion:** GSAP `ScrollTrigger` for restrained section reveals; one orchestrated hero moment; no
scattered micro-animations. Respect `prefers-reduced-motion`.

## 15. Deployment & Infrastructure (open decisions)

Not architecture-blocking, but flagged so they're decided before `IMPLEMENTATION_PLAN.md` M4/M6:

- **Hosting:** Vercel recommended (see §2), not mandated.
- **Booking persistence:** a hosted Postgres (Neon or Supabase are the two reasonable defaults)
  behind the `BookingRepository` interface — gives a clean migration path to the Phase 2 CRM
  mentioned in the brief without a rewrite. A local/SQLite adapter can stand in during development.
- **Notification delivery:** transactional email (Resend or Postmark) to ODIN's contact address,
  behind the `NotificationService` interface. Worth flagging to the client: ODIN's real
  day-to-day channels are phone/LINE/WhatsApp (§14 of the brief), not email — an email-only
  notification pipeline is the pragmatic MVP choice, but it's worth confirming ODIN staff will
  actually monitor that inbox promptly, or prioritizing a LINE notification integration sooner
  than "future."
