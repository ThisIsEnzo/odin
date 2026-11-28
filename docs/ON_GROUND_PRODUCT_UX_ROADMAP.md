# ON GROUND — Product & UX Improvement Roadmap

**Scope:** Follow-up work identified during the Iteration 05 UX/UI audit  
**Target:** Tourists and residents in Pattaya / Chon Buri  
**Branch:** `feature/odin-cinematic-experiences-iteration`  
**Status:** Planning document — no implementation work or business facts are implied by this roadmap.

This roadmap turns the audit findings into an ordered delivery plan. The delivery order is intentional: fix the visitor experience, content, localization, responsive/accessibility, SEO and performance first. Production credentials, integrations and end-to-end message delivery are the final launch gate, so we configure and verify them only after the rest of the journey is stable.

## Principles and constraints

- Preserve the THE LIVING ESTATE visual identity and the existing booking domain/API contracts unless a separately reviewed change is necessary.
- An enquiry is **not** a confirmed reservation. UI copy must never imply instant confirmation unless the business process actually supports it.
- Do not invent prices, availability, operating hours, transport, address details, reviews, testimonials or contact information.
- Use authentic property photography. Reference imagery is for art direction only and must not be presented as photographs of the venue.
- Keep EN / TH / RU / ZH supported throughout the work.
- Keep each implementation slice independently reviewable and tested. Do not merge or deploy solely because a visual change looks correct.

## Priority overview

| Priority | Workstream | Outcome | Dependency |
|---|---|---|---|
| Final launch gate | Enquiry delivery and production configuration | A real request reaches the business reliably | Production environment access and a confirmed delivery channel; complete after all UX/content/QA work |
| P0 — trust / conversion | CTA and enquiry-state language | Visitors understand they are submitting a request, not receiving a confirmed booking | Confirm actual response/confirmation process |
| P1 — high | Booking journey UX | Visitors choose what they want before being asked for personal details | Review current flow and preserve API/schema behaviour |
| P1 — high | Business trust and visit planning | Accurate location, contact, directions and visit information | Owner-supplied verified business facts |
| P1 — high | Photography and media content | Distinct, authentic imagery for each experience | Real venue photo assets and usage approval |
| P1 — high | Locale quality | Correct typography and readable content in all four languages | Native-language review, especially TH and ZH |
| P2 — quality | Responsive and accessibility QA | Reliable keyboard, touch, contrast and reduced-motion behaviour | Stable Preview build |
| P2 — quality | SEO, metadata and performance | Consistent share previews, indexing metadata and efficient media | Confirmed canonical production URL and final image assets |

---

## P0 — Make the enquiry journey truthful

### P0.2 Align CTA and confirmation copy with the real process

**Audit finding:** The site describes an enquiry flow, not an instant confirmed reservation. Some booking-oriented CTA wording can create a stronger expectation than the underlying process guarantees.

**Tasks**
1. Inventory all CTA and status strings across Hero, experience cards, final CTA, header, mobile booking bar and booking flow in EN / TH / RU / ZH.
2. Use request-oriented language where the action submits an enquiry (for example, “Request a Visit” / “Send Request”), not language implying an automatically confirmed booking.
3. Explain the next step before submission: the team will review the request and confirm availability/details.
4. Make the success state say the request was received, not that the visit is booked.
5. Confirm the actual response channel and expected response time with the owner before publishing any response-time promise.

**Acceptance criteria**
- CTA, form submit, loading, success and error states describe the same real process in all four locales.
- No copy promises instant confirmation or an unverified response time.

---

## P1 — Improve conversion, confidence and visit planning

### P1.1 Review and improve BookingFlow sequence

**Audit hypothesis:** Asking for personal details before the visitor has selected an experience may create unnecessary friction. Confirm this against the actual current UI before changing it.

**Proposed journey**
1. Select experience(s) or package.
2. Select preferred date/time and party size, where applicable.
3. Enter contact details and preferred contact method.
4. Review the request and submit.

**Tasks**
- Map the current steps, validation rules, query-string preselection and persistence behaviour.
- Identify which fields are truly required and which can be optional.
- Preserve request schema, API contracts, validation, idempotency, pricing and notification/outbox behaviour.
- Keep selected experience/package and entered data when moving backward between steps.
- Provide clear inline validation, loading, empty, success and recoverable error states.
- Test keyboard and mobile interaction.

**Acceptance criteria**
- A visitor can understand the steps and return to previous steps without losing input.
- Invalid fields are identified next to the relevant controls.
- A submission cannot be mistaken for a confirmed reservation.
- Existing backend contracts and duplicate protection remain intact.

### P1.2 Complete verified location and visit information

**Audit finding:** The current documentation flags mock address/contact data as a content debt. Any published details must be checked against the actual venue.

**Owner inputs required**
- Exact visitor-facing address and map pin.
- Confirmed phone / WhatsApp / other contact channels.
- Parking availability and any access restrictions.
- Whether visitors can arrive independently or need prior arrangement.
- Verified travel-time guidance from Pattaya, if the business is comfortable publishing it.
- Verified opening / visit hours and any seasonal restrictions.

**Tasks**
1. Replace mock values only after the owner confirms the facts.
2. Add a prominent directions action that opens the correct map pin.
3. Explain parking and arrival arrangements.
4. Clarify whether walk-ins are accepted or requests are required.
5. Ensure FAQ, footer, contact details, structured data and map all use the same source of truth.

**Acceptance criteria**
- No mock address, phone number or map pin is visible in public locales.
- Directions open the verified venue location.
- Published transport and opening information is owner-confirmed.

### P1.3 Make Restaurant a decision-ready section

**Tasks**
- Confirm whether the restaurant is open to non-activity visitors.
- Obtain an approved current menu and prices before displaying them.
- Select 4–6 real signature dishes only if the owner confirms they are available.
- Add authentic food / dining photographs.
- Distinguish restaurant operating hours from farm/activity hours.
- Explain whether table requests are separate from activity enquiries.

**Acceptance criteria**
- Visitors can tell what the restaurant offers, whether they can visit independently and how to enquire.
- No invented menu item, price or operating hour is published.

### P1.4 Replace repeated imagery with authentic venue photography

**Audit finding:** Iteration 05 documentation identifies repeated image assignments (Hero / gallery and Hero / restaurant). Verify the current asset mapping before replacing files.

**Required shot list**
- Arrival / establishing view of the actual property.
- Horse riding in the actual riding area.
- Pony riding, ideally showing the real family experience.
- ATV in motion on the actual route.
- Sauna interior and exterior.
- Restaurant atmosphere and real dishes.
- People / staff / instructors, with appropriate consent.

**Tasks**
1. Create an asset inventory: source, subject, dimensions, rights/consent, focal point and intended placement.
2. Assign a distinct image to each major section where possible.
3. Crop art-directed desktop and mobile focal points.
4. Generate responsive image sizes and use appropriate `sizes` / priority settings.
5. Ensure alt text describes the actual image; decorative images use empty alt text.

**Acceptance criteria**
- No accidental duplicate hero/gallery/restaurant assignments remain.
- Every image depicts the subject named by its section and alt text.
- Hero remains visually strong on narrow screens and does not obscure the main CTA.

### P1.5 Clarify packages and value

**Tasks**
- Confirm package composition, duration, participant limits and exclusions with the owner.
- Show individual inclusions in plain language.
- Show a package price or “details confirmed by the team” state according to verified data.
- Show savings only where a valid comparison against confirmed individual prices exists.
- Explain who each package suits (for example, couples, families or groups) without inventing suitability restrictions.

**Acceptance criteria**
- Visitors can compare individual experiences and packages without guessing what is included.
- No unsupported price, discount or availability claim is displayed.

### P1.6 Complete TH / ZH / RU / EN typography and copy QA

**Audit findings to verify and resolve**
- The current Noto Sans SC declaration in the locale layout specifies only the Latin subset; verify that Simplified Chinese glyphs are loaded from the intended font source.
- `Statement.tsx` and `SplitText.tsx` split text on spaces. This is not a suitable word-segmentation strategy for Chinese and can produce a single unsplit phrase.
- Long Russian and Thai strings need real-device / browser-width review.

**Tasks**
1. Load the correct Chinese glyph coverage and verify font fallback.
2. Use locale-aware animation segmentation or animate complete phrases for TH / ZH where word segmentation is not reliable.
3. Check translated CTA, form labels, validation, error and success messages with native speakers.
4. Check line breaks, punctuation, numerals, currency formatting and mixed Latin text.
5. Avoid fixed heights that clip translated content.

**Acceptance criteria**
- No missing glyphs, clipped text, broken word spacing or unusable CTA labels in any locale.
- Animation is optional enhancement; text remains readable without it and with reduced motion.

---

## P2 — Responsive, accessibility and technical quality

### P2.1 Responsive visual and interaction QA

Run a browser QA matrix on the actual Preview deployment:

- Widths: 360, 375, 390, 430, 768, 900, 1024, 1200, 1280 and 1440 px.
- Locales: EN, TH, RU and ZH.
- Key routes: homepage, experience deep links and booking flow.

**Check**
- No horizontal page overflow.
- No overlap between header, mobile booking bar, content and browser safe areas.
- No clipped headings, card facts, prices or CTA labels.
- Touch controls target at least 44 × 44 CSS px where practical.
- Sticky/fixed elements do not cover form fields or success/error messages.
- Images retain meaningful focal points at mobile and desktop aspect ratios.

**Deliverable:** Screenshot set with viewport and locale labels, plus a short defect list.

### P2.2 Accessibility pass

**Tasks**
- Test complete keyboard navigation, including mobile menu, language switcher, gallery lightbox and all booking steps.
- Verify visible focus indication on every interactive element.
- Check semantic heading order, landmarks, labels, error associations and image alt text.
- Measure rendered text/background contrast; target WCAG AA (4.5:1 normal text, 3:1 large text and relevant UI components).
- Verify modal focus management, Escape behaviour and focus restoration.
- Verify `prefers-reduced-motion` for Hero, Statement, SplitText and reveal transitions.
- Ensure autoplay / animated media has an accessible pause or does not start unexpectedly.

**Acceptance criteria**
- Core journey can be completed using keyboard only.
- No critical WCAG AA failures remain in the tested journey.
- Reduced-motion mode preserves all content and functionality.

### P2.3 SEO and social metadata consistency

**Audit observations**
- Locale layout builds Open Graph / Twitter metadata from `odin-hero.jpg`, while the Iteration 05 audit notes a different Hero asset is used by the page. Verify current production intent and align the images.
- `metadataBase` depends on `NEXT_PUBLIC_SITE_URL`; verify that this variable is set to the canonical production origin.
- Canonical URL, favicon and locale alternate output need direct rendered-page verification; they were not confirmed by source review alone.

**Tasks**
- Set and verify the canonical production URL.
- Align OG and Twitter image with the approved current Hero image.
- Verify title, description, favicon, canonical and hreflang for all four locales.
- Check generated metadata in the rendered HTML and validate share previews.
- Keep structured business data consistent with owner-confirmed address and contact details.

**Acceptance criteria**
- Share previews show the correct brand image and locale-specific metadata.
- All canonical and alternate URLs resolve to the intended public pages.
- Structured data contains no mock business facts.

### P2.4 Performance and runtime checks

**Tasks**
- Measure Core Web Vitals on mobile and desktop, especially LCP and CLS.
- Inspect Hero image loading, responsive image selection, font loading and layout reservations.
- Check whether the map iframe loads only when needed / near the viewport.
- Inspect console errors, failed requests, broken images and API failures.
- Verify production build and test output after each implementation slice.

**Acceptance criteria**
- No known broken first-party assets or uncaught runtime errors in the core journey.
- Hero media is appropriately sized for the viewport.
- Images and embeds reserve layout space to avoid avoidable CLS.
- Performance regressions are measured, not guessed.

---

## Final launch gate — Production enquiry delivery

This work is deliberately scheduled **last**, after the public-facing flow, verified content, localization, responsive/accessibility QA, SEO and performance work are complete. Do not delay the current UX fixes while waiting for production API credentials.

### P0.1 Verify production enquiry delivery

**Audit finding:** The Iteration 05 implementation note records that Vercel environment variables were not configured and that real enquiry delivery was therefore not ready. This is a documented deployment risk; the current live configuration must be rechecked rather than assumed.

**Tasks**
1. Inventory every environment variable required by the booking route, persistence layer and notification/outbox worker.
2. Verify Preview and Production values are present in the correct Vercel environments. Do not put secrets in source control or documentation.
3. Verify the production database / persistence connection and migration state.
4. Verify the actual notification destination and delivery provider with the business owner.
5. Submit a controlled end-to-end test enquiry and confirm:
   - server accepts valid input;
   - request is persisted exactly once;
   - manager notification is delivered;
   - failures are observable and recoverable;
   - duplicate submissions are safely handled;
   - the visitor receives an accurate success or failure state.
6. Test missing configuration and downstream provider failure. The UI must not show success if the request was not safely accepted.

**Acceptance criteria**
- One test enquiry is visible in the intended business workflow.
- Duplicate submission does not create duplicate requests.
- Failure states are visible to the visitor and diagnosable by the team.
- No secrets or personal data are exposed in client logs.

**Blocked by:** Vercel project access, confirmed production integration details and a person who can verify receipt.

## Delivery sequence

| Slice | Scope | Exit gate |
|---|---|---|
| 06A | CTA / enquiry copy consistency | All states truthfully describe request vs confirmation |
| 06B | Booking journey UX review and improvements | Full flow works without losing state or breaking contracts |
| 06C | Verified location, contact, restaurant and package content | All published business facts approved by owner |
| 06D | Authentic photo replacement and media optimization | Distinct, correct images across core sections |
| 06E | EN / TH / RU / ZH typography and copy QA | Locale matrix passes |
| 06F | Responsive + accessibility QA | Viewport, keyboard, contrast and reduced-motion checks pass |
| 06G | SEO + performance final pass | Metadata, runtime and performance checks documented |
| 06H | Production enquiry configuration and end-to-end delivery verification | Real test request reaches the business reliably |

Slices may be split into smaller PRs. The production enquiry integration is intentionally the final implementation/verification step and must pass before public launch. P1 content work depends on verified owner inputs and should not be filled with placeholders disguised as facts.

## Release checklist

- [ ] Production enquiry configuration verified.
- [ ] End-to-end request delivery and duplicate protection tested.
- [ ] CTA, submit, success and error copy accurately describe the request process.
- [ ] Business address, map pin, contacts, hours and access details owner-confirmed.
- [ ] Restaurant and package information verified.
- [ ] Real photography approved and image assignments checked.
- [ ] EN / TH / RU / ZH copy and typography reviewed.
- [ ] Responsive matrix captured at required widths.
- [ ] Keyboard, focus, contrast and reduced-motion checks completed.
- [ ] SEO metadata, canonical, hreflang, favicon and share image verified.
- [ ] Console, network, production build and performance checks recorded.

## Audit evidence and limitations

This roadmap is based on the Iteration 05 source/documentation review and the preliminary UX audit. The Preview URL was protected by Vercel Authentication during that audit, so computed browser styles, live console/network behaviour and the actual 1440 × 900 / 375 × 812 rendering were not independently verified. Findings described as hypotheses or verification tasks must be confirmed in the browser before implementation is treated as a defect.

The roadmap is planning documentation only. It does not claim that any item above has been implemented, tested, or released.
