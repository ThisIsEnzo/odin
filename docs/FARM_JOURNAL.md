# ON GROUND — Farm Journal (Stage 1 + Stage 2)

Base: `main` after PR #8. Branch: `feature/odin-farm-journal-stage-2`.

## Creative direction

**A Day on the Ground** — an authentic farm-journal experience built around
editorial craft and practical clarity, not generic luxury-resort conventions.

The existing Editorial Estate and Slow Country foundations remain in place.
The Farm Journal layer gives the homepage a clearer editorial chapter system
and distinct compositions while retaining the approved earth/terracotta/cream
identity and existing motion primitives.

## Implemented

### Stage 1 — practical clarity and metadata

- Server-rendered VisitBrief immediately after the homepage hero.
- Distance, restaurant hours and configured bookable-experience count sourced
  from existing data modules.
- Restaurant hours are explicitly labelled, not presented as whole-property hours.
- Existing map listing and request-to-book CTA.
- Open Graph/Twitter metadata, locale alternates and `NEXT_PUBLIC_SITE_URL`
  metadata base when configured.
- LocalBusiness JSON-LD with locality and verified map listing only. No
  restaurant hours are assigned to the whole property.
- Unit coverage for the VisitBrief data contract.

### Stage 2 — editorial chapters

- Shared `ChapterHeading` / `ChapterMark` primitives with split, stack,
  overlay and ledger compositions.
- **01 Experiences:** chapter-led split heading.
- **02 The place:** asymmetric photo-led story, editorial narrative and
  numbered pillars using existing translations and photography.
- **03 Plan your day:** numbered package ledger. Package definitions and
  pending-price messaging remain canonical; mock prices are never surfaced.
- **04 The table:** full-width cinematic restaurant treatment with the
  existing restaurant image and confirmed restaurant hours only.
- **05 Moments, 06 Find us, 07 Questions:** restrained numeral rails ahead of
  the existing Gallery, Location and FAQ sections; their working internals
  remain unchanged.

## Factual boundaries

- Age restrictions on Horse Riding, Pony Riding and ATV are marked mock and
  must not be presented as confirmed business facts.
- Restaurant hours (07:00–23:00) describe the restaurant only.
- Sauna price/quantity basis, package pricing, menu, average spend and contact
  details remain subject to business confirmation where their source data is
  marked mock.
- The street address in `siteConfig` is mock and is not emitted into JSON-LD.
- No unverified coordinates, phone number, rating or price range is published.

## i18n and accessibility

- All visible copy uses existing EN/TH/RU/ZH translation keys; no new copy keys
  or hardcoded business claims were introduced.
- Chapter numerals are decorative and hidden from assistive technology.
- VisitBrief has a semantic heading; action links retain visible keyboard focus.
- Existing reduced-motion and Reveal progressive-enhancement behavior is used.

## Photography and content gaps

Commission real photography for family/pony riding, horse-riding details, ATV
motion, sauna atmosphere, restaurant/table and seasonal dishes, farm grounds
and arrival signage. Existing local image assets are reused; no remote image
source was introduced.

Business confirmation still needed for sauna price/quantity basis, package
prices/arrangements, menu, average spend, verified street address/coordinates,
phone, LINE, WhatsApp, response-time policy, age restrictions and real reviews.

## QA status

Typecheck, lint, Vitest, production build, responsive browser QA, keyboard and
reduced-motion inspection, screenshots and performance measurements have not
been run in this GitHub-only workflow. They are required before merge.
