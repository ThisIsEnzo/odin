# ODIN — Implementation Plan

Status: Phase 0 (this document set) complete. No existing repository was found in this
environment, so implementation starts greenfield unless prior work is supplied for reconciliation
(see `ARCHITECTURE.md` §1).

All milestones below (M1–M6) fall entirely within the brief's own "Phase 1 / MVP" scope (§12).
Everything in its "Phase 2" list — CRM, accounts, loyalty, payments, dynamic pricing, real-time
availability, advanced admin, a mobile app — stays out of scope for all of them, per §13 and §34.

## M1 — Project Foundation

**Objective:** a running, typed, translatable shell with no real pages yet.

- `create-next-app` on Next.js 16, TypeScript strict, Tailwind v4, `src/` layout
- `next-intl` wired end to end: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`,
  `src/proxy.ts` (Next.js 16 convention — not `middleware.ts`)
- `src/data/odin/*.ts` populated with the full MOCK dataset from `MOCK_DATA.md`, typed per
  `DATA_MODEL.md`
- Base layout: `Header`, `Footer`, `LanguageSwitcher`, `MobileNav`
- `src/lib/env.ts` (Zod-validated env) + `.env.example`
- ESLint/Prettier, Vitest scaffold, CI skeleton (`tsc --noEmit`, `eslint`, `vitest run`, `next build`)

**Exit criteria:** placeholder homepage renders and switches correctly across `en`/`th`/`ru`/`zh`;
`next build` passes; a Vitest test asserting `horse-riding.restrictions.maxWeightKg === 90` and
`pony-riding.restrictions.maxWeightKg === 60` passes (this is the regression guard called out in
`ARCHITECTURE.md` §13 — it should exist from the very first commit that defines the data, not be
added later).

## M2 — Static Marketing Pages

Homepage (all 10 sections per §20), About, Location, FAQ, Gallery (with lightbox, lazy loading,
alt text), Reviews (pending §6 of `MOCK_DATA.md` — may ship empty/omitted at MVP).

**Exit criteria:** every page renders correctly in all four locales; Lighthouse mobile ≥ 90 on
performance and accessibility for the homepage; no hardcoded copy or business data in any
component (spot-checked against `ARCHITECTURE.md` §5–6).

## M3 — Experience, Restaurant & Packages Pages

The reusable `[slug]` Experience Page (`generateStaticParams` → the four known slugs), Restaurant
page, Packages page.

**Exit criteria:** all four experience pages render from the single template with zero
per-activity duplicated JSX; Restaurant and Packages pages are fully data-driven from
`src/data/odin`.

## M4 — Booking Flow

Multi-step `BookingForm`, `booking.schema.ts` (shared client/server), `POST /api/booking`,
`BookingRepository` + `NotificationService` with a working local/dev adapter (so this milestone
isn't blocked on the hosting/email provider decision), honeypot + rate limiting.

**Exit criteria:** a booking submits end to end in development and returns `status: 'received'`;
a request that attempts to bypass client validation (e.g. posting `weightKg: 95` for
`horse-riding` directly to the API) is independently rejected server-side.

## M5 — SEO, Analytics & Accessibility Hardening

`app/sitemap.ts` / `app/robots.ts` with hreflang alternates, per-locale metadata, structured data
(`LocalBusiness`, `FAQPage`, `BreadcrumbList`), analytics abstraction wired to a chosen provider,
axe/Lighthouse accessibility pass across the booking flow and homepage, contrast check on the
brand palette (`ARCHITECTURE.md` §14).

**Exit criteria:** WCAG 2.1 AA spot checks pass on the booking flow and homepage; sitemap validates;
each page has correct hreflang alternates for all four locales.

## M6 — QA & Launch Prep

Cross-device/browser QA, `docs/QA_REPORT.md` produced, full pass against the `MOCK_DATA.md` §7
pre-launch checklist, deployment target provisioned (hosting + database + email, real
credentials), production environment variables set.

**Exit criteria:** every item in `MOCK_DATA.md` §7 is checked off or explicitly deferred with
sign-off; production build deployed to a staging URL for final review.

## Dependencies / External Decisions

Flagged here so they're resolved before they actually block something, not discovered mid-milestone:

| Decision | Blocks | Notes |
|---|---|---|
| Persistence provider (Neon / Supabase / other) | M4 going to production, not M4 development | Dev proceeds on a local adapter |
| Email/notification provider (Resend / Postmark) | Same | Same |
| Real photography | Visual polish in M2/M3, not their structure | Local placeholders per §23 unblock structure now |
| Professional translation review (th/ru/zh), especially legal pages | M6 launch | Machine-assisted drafts are fine for internal review, not for shipping |
| Legal review of `/privacy` and `/terms` | M6 launch | Thailand PDPA at minimum — see `MOCK_DATA.md` §7 |
| Reviews source decision (ship empty vs. real testimonials) | M2 scope for the Reviews section | See `MOCK_DATA.md` §6 |
| Days-closed / blackout-dates confirmation | Low urgency — data model already supports it | Currently assumed open 7 days/week |

## Suggested Sequencing

M1 is a hard prerequisite for everything else. M2 and M3 can run largely in parallel once M1's
data layer lands (they touch different route trees). M4 depends on M1's validation library and
data layer but not on M2/M3. M5 layers on top of M2–M4 and should start once those are
structurally complete, not wait for full content polish. M6 is the launch gate. Given this reads
as a solo/small-team freelance build, the realistic path is mostly sequential (M1 → M2 → M3 → M4 →
M5 → M6) with M2/M3 overlap where time allows, rather than true parallel workstreams.

## Recommended Next Step

Start M1. The single highest-leverage first commit is the data layer (`src/data/odin/*.ts` +
`src/types/domain.ts`) plus its Vitest regression test — everything else (validation, UI,
booking) reads from it, so getting it right first avoids rework.
