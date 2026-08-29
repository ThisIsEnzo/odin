# ODIN — PROJECT STRUCTURE

This document is a map of the current consolidated project.

## Application

src/app/[locale]/
- page.tsx — homepage composition
- book/page.tsx — public request-to-book flow
- error.tsx
- not-found.tsx
- layout.tsx

src/app/api/booking/
- route.ts — public booking request endpoint

## Homepage

src/components/homepage/
- ExperienceShowcase.tsx
- Hero.tsx
- HeroSlideshow.tsx
- WhyOdin.tsx
- Packages.tsx
- Restaurant.tsx
- Gallery.tsx
- ReviewsLocation.tsx
- Faq.tsx
- FinalCta.tsx

## Booking

src/components/domain/booking/
- BookingFlow.tsx
- BookingStepper.tsx
- RequestReceived.tsx
- steps/ExperienceStep.tsx
- steps/ScheduleStep.tsx
- steps/GuestsStep.tsx
- steps/CustomerStep.tsx
- steps/ReviewStep.tsx

src/lib/booking/
- rules.ts
- time-slots.ts
- repository.ts
- notify.ts

src/lib/validation/
- booking.schema.ts

## Data

src/data/odin/
- site.ts
- experiences.ts
- packages.ts
- restaurant.ts
- gallery.ts
- reviews.ts
- faq.ts

## Shared UI

src/components/ui/
- Button.tsx
- Card.tsx
- Badge.tsx
- Container.tsx
- Section.tsx

## Motion

src/components/motion/
- Reveal.tsx
- Parallax.tsx

## Internationalization

messages/
- en.json
- ru.json
- th.json
- zh.json

src/i18n/
- routing.ts
- request.ts
- navigation.ts

## Brand Assets

public/images/brand/
- odin-logo-original.jpg — full supplied logo artwork
- odin-logo-full.jpg — full lockup
- odin-logo-icon.jpg — icon/emblem

## Important architecture rule

Do not duplicate:
- business data
- business rules
- booking validation
- translations
- image data

Use the existing canonical source.

## Current product direction

ODIN is a countryside farm/resort near Pattaya offering:
- Horse Riding
- Pony Riding
- ATV
- Sauna
- Restaurant

The current public product should remain simple:
public website + request-to-book flow + backend persistence/notification.

CRM/admin is NOT required for the current phase.