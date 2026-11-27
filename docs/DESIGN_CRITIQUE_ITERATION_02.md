# ON GROUND — Design critique, iteration 02

Baseline: merged PR #12 (THE ESTATE). Evidence supplied by the owner: desktop, mobile and tablet homepage screenshots plus desktop booking screenshot.

## What works
- Asymmetric forest hero panel and tall photography establish a destination-led identity.
- Linen / forest / charcoal surface rhythm is more distinctive than the earlier cream-heavy template.
- The overlapping offer card is a useful editorial device.
- Booking's forest heading band and retained request-to-book language are directionally sound.

## Defects observed in screenshots
1. Experience offer price wraps in the middle of the currency amount (e.g. THB 1,20 / 0.00), making the interface look broken.
2. Experience rail displays external-link arrows although the controls are tabs.
3. Gallery frames, map area and booking activity image areas appear blank in the supplied captures; CSS fallbacks alone do not prove the image/embed actually loads.
4. Section 02 remains a familiar two-column text/card layout over a dark, muddy image; the image has insufficient presence.
5. Dining/pavilion photography is repeated across major sections.
6. Hero panel has weak vertical anchoring and too much unstructured space.
7. Booking fields feel sparse and the image placeholders weaken perceived quality.
8. The mobile sticky booking bar overlaps the hero note/place line in the supplied capture.

## Iteration decisions
- Remove misleading arrows from experience selection tabs and use one accessible tab panel.
- Keep the currency amount unbroken with tabular numerals and widen the offer card.
- Recompose Section 02 around a brighter full-bleed photograph, text scrim and offset inset image.
- Add an intentional visible directions fallback behind the existing map embed.
- Keep gallery media regions on warm fallback surfaces and prioritize the dominant desktop gallery images.
- Anchor hero with a top brand rail, central content and bottom location line; change slideshow order to reduce repeated dining imagery.
- Restyle booking inputs with stronger labels and warm filled surfaces while preserving its existing behavior.

## Integrity
No business data, pricing, restrictions, policies, testimonials, contact facts, booking schema, validation, API, idempotency, estimates, package selection, persistence or notification behavior is intentionally changed. Existing EN / TH / RU / ZH translations and mock-data safeguards remain in use. Request submission remains a request, not a confirmed reservation.

## Validation status
Source changes are committed to this Draft PR. Typecheck, lint, tests, production build, browser QA, responsive screenshots and locale matrix have **not** been run in this environment. The owner must review real browser captures before merge.
