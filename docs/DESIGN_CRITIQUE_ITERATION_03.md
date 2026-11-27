# ON GROUND — Iteration 03: Trust, Conversion & Experience Polish

## Scope

Focused corrections on top of the merged THE ESTATE direction (PR #12) and screenshot-driven refinement (PR #13).

## Changes

- Centralized offer-price selection. Mock experience prices and mock package prices are suppressed before duration tiers are considered.
- Added explicit optional hours-confirmation metadata. Only Horse Riding and Pony Riding are marked confirmed; ATV and Sauna hours are not displayed.
- Updated Footer copy in EN / TH / RU / ZH so 07:00–23:00 is clearly identified as restaurant hours, not property-wide opening hours.
- Replaced the stale MobileBookBar selector with estate-hero detection and IntersectionObserver. Non-home pages and browsers without IntersectionObserver retain a scroll fallback. The CTA link exists in the DOM only while visible.
- Prevented currency values from wrapping internally.
- Made Gallery data the single source for paths and focal points. Failed images use a branded fallback rather than a broken-image rectangle.
- Removed the reused dining image from Final CTA and replaced it with a brand-led forest invitation.
- Reduced the Hero slideshow to two images, removing the restaurant image from the rotation.
- Retained PR #13 Hero anchoring and Section 02 photo/scrim styles, which were already present.

## Photography constraints

Hero frame two and the Gallery restaurant frame are exact duplicate assets (odin-hero-2.jpg and odin-gallery-04.jpg). This remaining overlap needs a distinct real photograph. The Story section also crops two Gallery assets as background/inset photography. Do not substitute stock or generated imagery.

## Preserved

BookingFlow, request schema, validation, API payload, idempotency, pricing calculations, promotions, package selection, persistence and notification outbox are unchanged. Requests remain requests, not confirmed reservations. No mock prices, unconfirmed hours, fictitious reviews, addresses or contacts were promoted to confirmed facts. No Vercel environment variables, live database or real LINE / WhatsApp delivery were configured.

## Verification

Unit regression tests were added for mock-price suppression and confirmed-hours gating. Tests, typecheck, lint, production build and browser/responsive QA were not run through this GitHub authoring session.

The Vercel project currently has no environment variables. Production booking submissions therefore remain unconfigured until a separate safe test database, notification route and secrets are provisioned. No fake successful submission is introduced.

Before merge, run npm ci, npm run typecheck, npm run lint, npm test and npm run build; inspect 360 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 px in EN / TH / RU / ZH.
