# Iteration 05 — Cinematic Hero, Statement & Experience Colour Blocks

## Scope delivered

This PR contains the first implementation slice supplied for this iteration. It does not invent or implement the not-yet-supplied second part.

- Added a warm reflected-light bloom and a subtle linen seam over the existing authentic Hero photograph.
- Reused the existing SplitText component for the Hero headline and added optional id support for semantic aria-labelledby wiring.
- Added the editorial home.statement between Hero and Plan Visit in EN / RU / TH / ZH.
- Implemented progressive colour reveal when the Statement enters the viewport. Thai and Chinese render as complete phrases rather than being incorrectly split on spaces. Reduced-motion and no-IntersectionObserver fallbacks remain readable.
- Replaced the tab-based Experiences selector with four always-visible activity panels using individual natural colour families.
- Preserved canonical offerPrice, confirmedHours, durationLabel, translation namespaces, booking links and local booking images.
- Kept numeric prices unbroken while allowing pending manager-confirmation copy to wrap inside its own fact column.
- Added estate-cinematic.css and imported it after the existing Living Estate stylesheet.
- Removed duplicate price-fit declarations from living-estate.css while retaining the unique official wordmark styles.

## Design intent

The new surface borrows broad principles only: cinematic light over the real farm image, a light editorial transition, a reveal-on-scroll statement and individual colour identities for experiences. No reference logo, wording, trademark, proprietary symbol or recognisable composition is reused.

## Preserved

BookingFlow, request schema, API contracts, validation, idempotency, pricing logic, package selection, persistence and notification outbox are unchanged. Requests remain requests, not confirmed reservations. No mock price, unconfirmed hour or new business fact is presented as confirmed.

## Validation

Run typecheck, lint, unit tests and production build. Browser-check all four locales and widths 360 / 375 / 390 / 430 / 768 / 900 / 1024 / 1200 / 1280 / 1440 px. Inspect Statement reveal and reduced motion, all four activity panels, especially the Sauna pending-price state, and CTA wrapping.
