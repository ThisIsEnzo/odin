# ON GROUND — THE LIVING ESTATE

## Creative direction

The homepage now uses a coherent visual system inspired by the supplied reference videos' general design principles: cinematic imagery, editorial typography, purposeful whitespace, restrained material texture, clear grids and varied section rhythm. No reference logo, wordmark, proprietary icon, phrase, exact layout or branded composition was reused.

Three directions were considered:

- **A — The Living Estate:** image-led hospitality, natural light and a strong sense of place.
- **B — Field Journal:** typographic editorial layouts, curated stills and structured notes.
- **C — A Day Unfolds:** a sequential visit story from arrival through activity, relaxation and food.

**Chosen: A — The Living Estate.** It communicates the physical destination first, gives the photography a clear role and allows each subsequent section to use a different composition without turning the homepage into a linear booking funnel.

## Homepage rhythm

1. Full-bleed arrival image and concise primary action.
2. Linen information section with distance, restaurant hours and activity count; one directions action.
3. Experience selector with a responsive tab rail and image-led information plate.
4. Atmospheric brand story with a separate readable notes panel; the old overlapping inset image is removed.
5. Package ledger with explicit pending-price state.
6. Restaurant image and confirmed opening hours.
7. Asymmetric gallery mosaic with the existing accessible lightbox.
8. Honest guest-story empty state until permissioned real reviews exist.
9. Location and existing Google Maps embed / Maps URL.
10. Native FAQ disclosure.
11. Final booking invitation with a restrained brand signature.

## Data integrity

- Price selection checks the canonical mock/provenance flag before reading duration tiers. The Sauna price remains pending.
- Operating hours are displayed only when `hoursConfirmed === true`.
- Existing restaurant hours remain the confirmed 07:00–23:00 value.
- No mock address/contact data, fictitious reviews, menu items, awards, package prices, age limits or availability claims are introduced.
- BookingFlow, booking schemas, API payloads, validation, idempotency, pricing engine, promotions, persistence and notification outbox are untouched. CSS changes to booking are presentation-only.
- A booking request remains a request; the copy continues to explain that the team confirms availability.

## Visual asset constraints

The implementation uses only existing authentic local images. The available library contains known duplicate assets (including `odin-hero-2.jpg` / `odin-gallery-04.jpg` and `odin-hero-3.jpg` / `odin-restaurant.jpg`). The new Story uses the existing wide farm photograph; the Gallery retains its canonical image list. A distinct arrival image, family/pony moment, horse detail, ATV motion and additional restaurant/sauna coverage would improve future art direction. No stock or generated photography was substituted.

## Engineering notes

- New styles live in `src/app/living-estate.css`, imported beside the existing global stylesheet in the locale layout.
- The components use current domain types, next-intl namespaces and local canonical data. In particular, the existing namespace is `bookingPricing`, not `booking.pricing`.
- `MobileBookBar` observes the complete `.le-hero`.
- Gallery keeps the existing Radix lightbox implementation and canonical image/alt data.
- Existing header, language switcher, footer, metadata and route handling remain in place.

## Validation

Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. Inspect the homepage, all four experience tabs, location, FAQ and booking surface at 360 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 px in EN / TH / RU / ZH.

Do not use live booking integrations or real customer data in Preview. The Vercel project previously had no environment variables configured; the real booking endpoint remains a separate deployment-configuration blocker.
