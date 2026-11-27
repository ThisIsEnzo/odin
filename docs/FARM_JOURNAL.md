# ON GROUND — Farm Journal (Stages 1–3)

Base: `main` after PR #9. Stage 3 branch: `feature/odin-farm-journal-stage-3`.

## Creative direction

**A Day on the Ground** — an authentic farm-journal experience built around
editorial craft and practical clarity, not generic luxury-resort conventions.
The approved earth/terracotta/cream identity and the existing motion system
remain the visual foundation.

## Implemented

### Stage 1 — practical clarity and metadata

- Server-rendered VisitBrief immediately after the homepage hero.
- Distance, restaurant hours and configured bookable-experience count sourced
  from existing data modules.
- Restaurant hours are explicitly labelled, not presented as whole-property hours.
- Existing map listing and request-to-book CTA.
- Open Graph/Twitter metadata, locale alternates and configured metadata base.
- LocalBusiness JSON-LD with supported locality and verified map listing only;
  restaurant hours and mock street/contact details are excluded.
- Unit coverage for the VisitBrief data contract.

### Stage 2 — editorial chapters

- Shared `ChapterHeading` primitive with split, stack, overlay and ledger
  compositions.
- **01 Experiences:** chapter-led split heading.
- **02 The place:** asymmetric photo-led story and numbered story pillars.
- **03 Plan your day:** package ledger using canonical package data and
  pending-price treatment for mock prices.
- **04 The table:** cinematic restaurant treatment with restaurant hours only.

### Stage 3 — complete the lower homepage

- Remove the standalone 05–07 numeral rails before Gallery, Location and FAQ;
  those sections now establish their own visual hierarchy.
- **Moments / Gallery:** asymmetric photographic essay on desktop, mobile
  horizontal snap strip, existing lightbox, keyboard navigation and alt text.
- **Guest Stories:** real, permissioned reviews only. Since the canonical
  reviews data is currently empty, show the translated coming-soon state rather
  than invented quotes, names, ratings or review counts.
- **Find us:** map-led layout with the existing verified Google Maps embed and
  existing directions link. No mock street address, inferred coordinates or
  invented travel time is shown.
- **Questions / FAQ:** editorial layout using the existing FAQ data and
  translations; native `details/summary` interaction retains keyboard and
  screen-reader behavior.
- **Invitation / Final CTA:** static full-bleed image and framed copy, replacing
  the pinned scroll-scene treatment on the homepage. Request-to-book links are
  preserved.
- The shared `ScrollScene` primitive remains in the codebase; it is simply no
  longer used by the homepage finale.

## Factual boundaries

- Age restrictions on Horse Riding, Pony Riding and ATV remain mock and must
  not be presented as confirmed business facts.
- Restaurant hours (07:00–23:00) describe the restaurant only.
- Sauna price/quantity basis, package pricing, menu, average spend and contact
  details remain subject to business confirmation where source data is mock.
- The street address in `siteConfig` is mock and is not exposed by the
  homepage location section or structured data.
- No unverified coordinates, phone number, rating or price range is published.
- No review content is fabricated.

## i18n and accessibility

- Existing EN/TH/RU/ZH translation keys are reused; Stage 3 adds no visible
  business claims or unreviewed translation strings.
- The Gallery lightbox continues to use the existing accessible Radix Dialog,
  focus management, Escape handling, arrow-key navigation and touch gestures.
- FAQ uses native `details/summary`; the answer remains available when opened
  without JavaScript-driven interaction.
- Decorative symbols are hidden from assistive technology where appropriate.
- Responsive layout and Thai/Chinese typography overrides are included.

## Photography and content gaps

The current Gallery assets and alt descriptions should be visually checked
against the real photography before launch. Commission real photography for
family/pony riding, horse-riding details, ATV motion, sauna atmosphere,
restaurant/table and seasonal dishes, farm grounds and arrival signage.

Business confirmation is still needed for sauna price/quantity basis, package
prices/arrangements, menu, average spend, verified street address/coordinates,
phone, LINE, WhatsApp, response-time policy, age restrictions and real reviews.

## QA status

Typecheck, lint, Vitest, production build, responsive browser QA, keyboard and
reduced-motion inspection, screenshots and performance measurements have not
been run in this GitHub-only workflow. They are required before merge.
