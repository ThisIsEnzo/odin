# HERO 04 — Cinematic Arrival

## Diagnosis

The previous THE ESTATE hero used a forest-green text panel beside a photograph. It read as a conventional two-column hospitality landing-page template: the message sat next to the image instead of becoming part of the scene. A two-image autoplay slideshow added movement without advancing the story, and the photo assignment made the restaurant/pavilion visual too prominent in the first impression.

## Direction selected

**Cinematic Arrival** — one full-bleed authentic landscape frame with editorial type integrated into the scene.

The composition has one primary booking action on the photograph, a restrained circular travel-postmark signature, and a linen docking strip immediately below it. The secondary “See experiences” action lives in that strip instead of competing with the primary CTA.

The strip gives way directly to the existing Visit Brief section. Its existing request-to-book note and factual summary remain unchanged.

## Photography

The Hero uses the existing local asset \`/images/hero/odin-hero-2.jpg\`, selected in the supplied art-direction assessment for its wide farm/landscape framing and usable sky/negative space. No stock or generated image was introduced.

**Known content limitation:** \`odin-hero-2.jpg\` and \`odin-gallery-04.jpg\` are byte-identical Git objects. The same photograph therefore remains in the Gallery until a distinct authentic image is provided. This PR does not relabel the Gallery item or fabricate replacement photography.

## Implementation

- Replaced the estate split-panel Hero with a full-width single-image scene.
- Removed autoplay, slide controls and the slideshow component.
- Placed the headline and primary CTA within the photograph, with responsive scrim behavior.
- Added an SVG travel postmark using the existing place identity.
- Moved the existing secondary action into a linen strip under the scene.
- Updated the mobile booking bar to observe the new \`.arrival\` wrapper, including its docking strip.
- Removed obsolete split-panel Hero CSS.
- Preserved all four locales, existing translated content, header/navigation, booking route and request-to-book semantics.

## Boundaries

No booking flow, payload, validation, persistence, notification, pricing, reviews, contact details, property opening hours or other business facts were changed.

## Validation

Typecheck, lint, unit tests, production build and browser screenshots were not executed during GitHub API authoring. No visual QA is claimed.

Before merge, inspect 360 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 px in EN / TH / RU / ZH. Check image crop, postmark placement, CTA contrast, title wrapping, header integration, safe areas and the mobile booking bar.
