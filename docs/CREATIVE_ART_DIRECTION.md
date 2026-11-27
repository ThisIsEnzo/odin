# ON GROUND — Creative Art Direction: THE ESTATE

## Why a new direction is needed

The existing Farm Journal system is coherent and practical, but the main visual moments still read too much like a familiar hospitality landing page: a full-bleed text hero, a conventional tab-and-image selector, a sticky photograph beside numbered story rows, and a standard form. The requested change is a stronger and more memorable point of view, not another small polish pass.

## Concepts considered

1. **FIELD LEDGER** — paper, ink, field notes and stamped details. Distinctive but too close to the existing Farm Journal language.
2. **SUN-FADED MODERNISM** — confident blocks of ochre, clay and moss with a geometric grid. Contemporary, but it risks reading as a lifestyle brand detached from the real farm.
3. **THE ESTATE** — selected. Contemporary countryside with forest-green and charcoal as strong anchors, warm linen interludes, sun-faded ochre and clay accents, dramatic image fields, layered editorial panels and a more expressive display-serif scale.

## Selected direction

**THE ESTATE — contemporary countryside**

- **Surface rhythm:** forest hero → linen visit brief → image-led experiences → charcoal place story → existing package and restaurant content → linen gallery and FAQ → dark invitation.
- **Colour:** retain the official ON GROUND identity and its approved terracotta/cream system. Add forest, charcoal, linen, ochre and clay as a supporting art-direction palette. Do not recolour or redraw the official logo.
- **Typography:** use the existing display-serif and UI font stack. Keep Thai and Chinese line-height/letter-spacing overrides and avoid forcing Latin display typography onto those scripts.
- **Photography:** use only existing repository image paths. Do not add stock imagery or present placeholder artwork as verified activity photography.
- **Motifs:** folio labels, fine rules, quiet image captions, architectural overlap and large but carefully constrained serif typography.
- **Motion:** keep existing slideshow, Parallax and Reveal primitives; respect reduced motion. No scroll-jacking, pinned scenes or new motion dependencies.

## Section composition

### Hero

Replace the centered full-bleed text-over-image layout with an asymmetric composition: a forest-green typographic panel on one side and a tall photographic stage on the other. On narrow screens the photograph appears first, followed by the content panel. Keep the existing slideshow, locale-specific copy, navigation links and accessible slide controls.

### 01 — Experiences

Replace the large tab panel plus mobile accordion with one responsive experience stage. A clear index rail selects the active experience; mobile uses horizontally scrollable chips and desktop uses a vertical editorial rail. The active image carries a linen details panel that overlaps its lower edge. All content remains sourced from canonical experience data and existing translations; hours, restrictions, OfferFacts and request links are retained.

### 02 — The Place

Replace the sticky photo / numbered list split with an immersive charcoal scene, a large existing translated statement and a linen field-notes sheet. Keep the three existing pillars, configured distance and canonical experience count. The second inset photograph is decorative and does not introduce new factual copy.

### Booking

Restyle the existing BookingFlow in place: forest heading panel, linen page surface, quieter underline fields, architectural selection cards and a dark estimate panel. The interaction remains the existing form → review → request-received flow. This change is presentation-only.

### Remaining homepage

Keep the established order and content of VisitBrief, packages, restaurant, gallery, reviews/location, FAQ and final invitation. A restrained linen surface rhythm ties the new hero/experience/story/booking compositions to the rest of the page without changing the underlying data or copy.

## Integrity and behavior boundaries

- Do not change BookingFlow, request schema, field validation, API payload, idempotency behavior, price estimates, package selections, promotion calculations, database persistence, notification outbox or request-received semantics.
- A submitted request is not a confirmed reservation.
- Preserve all four supported locales: EN / TH / RU / ZH. Reuse existing translation keys; no unsupported business claims or new factual content.
- Preserve mock-data suppression, existing map behavior, current reviews state and official brand assets.
- Existing media paths are reused; do not assume that referenced images have passed browser/network verification.

## Verification status

This GitHub-only implementation has not been run through local typecheck, lint, unit tests, production build or browser visual QA. It also has not been inspected at runtime in the four locales. These checks and screenshots at 360 / 390 / 768 / 1024 / 1280 / 1440px are required before merge.

## Follow-up photography

The repository documentation continues to identify authentic photography as a content gap. Commission real images for people and pony/horse riding, ATV movement, sauna atmosphere, restaurant/table, grounds and arrival. Do not fill the gap with generic stock imagery.
