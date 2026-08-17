# ODIN — Mock Data Registry

Status: Phase 0 draft. Purpose: a single, explicit audit trail of what's real vs. placeholder, so
nothing MOCK quietly ships as if it were verified business information. Every row here should be
re-confirmed with the ODIN business owner before production launch — see the checklist in §7.

## 1. Confirmed — NOT mock

These are load-bearing for booking validation and must not be changed without explicit business
sign-off (a code review comment isn't enough — see `BOOKING_RULES.md` §2):

| Item | Value |
|---|---|
| Horse Riding — operating hours | 07:00–18:00 |
| Horse Riding — max rider weight | **90 kg** |
| Pony Riding — operating hours | 07:00–18:00 |
| Pony Riding — max rider weight | **60 kg** |
| ATV — operating hours | 07:00–20:00 |
| Sauna — operating hours | 08:00–21:00 |
| Restaurant — operating hours | 07:00–23:00 |
| Location | Approximately 20 km from Pattaya (deliberately approximate — no GPS coordinates invented) |
| Business name | ODIN |

## 2. Mock — Business / Contact Info

| Field | Value | Note |
|---|---|---|
| Address | 88/8 Rural Road, Nong Prue, Chon Buri, Thailand | MOCK |
| Phone | +66 81 234 5678 | MOCK |
| Email | hello@odin-farm.example | MOCK — `.example` is a reserved non-production domain, will hard-fail real delivery if not replaced |
| LINE | @odinexperience | MOCK |
| WhatsApp | +66 81 234 5678 | MOCK |

## 3. Mock — Pricing

| Item | Price |
|---|---|
| Horse Riding | 1,200 THB / person |
| Pony Riding | 500 THB / child |
| ATV | 1,500 THB / vehicle |
| Sauna | 800 THB / person |
| Restaurant (average spend) | 500–800 THB / person |
| Family Day package (Pony + Farm experience + Restaurant) | 1,990 THB / family |
| Adventure Day package (ATV + Restaurant) | 2,490 THB / person |
| Couple Escape package (Horse + Sauna + Restaurant) | 3,990 THB / couple |

## 4. Mock — Age / Other Restrictions

| Experience | Age restriction |
|---|---|
| Horse Riding | 12+ |
| Pony Riding | 3–12 |
| ATV | 16+ |

(Contrast with §1 — the *weight* limits for horse and pony are confirmed; the *age* brackets here
are not.)

## 5. Not Yet Defined At All — gaps, not even mock

These aren't in the brief as MOCK values because no placeholder was specified — they need either a
decision or a clearly-scoped placeholder before the relevant page can be considered done:

- **Restaurant menu** — §22 marks it MOCK but no menu content was supplied; needs placeholder
  dishes before the Restaurant page can be built.
- **Gallery photography** — real photos aren't available; §23 already directs local placeholders
  over unstable external URLs, which the architecture follows.
- **Customer reviews / testimonials** — see §6 below, this one needs care, not just a placeholder.
- **Legal content for `/privacy` and `/terms`** — no source text provided.
- **Days closed / blackout dates** — nothing in the brief states ODIN is closed any day of the
  week; current assumption is open 7 days/week. `SiteConfig.closedWeekdays` and
  `blackoutDates` exist in the data model specifically so this can be populated later without a
  schema change (`DATA_MODEL.md` §3).
- **Guest count upper bound per booking** — not specified; treated as unbounded pending input.

## 6. Reviews — a flag worth reading, not just a checkbox

The homepage and domain model both include a Reviews section/entity, but no real testimonials were
provided. **Recommendation: don't populate this with fabricated reviews attributed to fictitious
customers.** Invented five-star quotes from invented named customers is the kind of thing that
creates real problems later — it reads as a fake-review practice if discovered, independent of
intent, and several jurisdictions (including consumer-protection rules that would apply to
marketing aimed at customers in the EU/UK, alongside Thai advertising standards) treat fabricated
testimonials as a compliance issue, not just a style question.

Two workable paths, either is fine:
1. Ship without the Reviews section at MVP launch, add it once real testimonials exist.
2. Keep the section, but only with real reviews (even 2–3 genuine ones from early guests, sourced
   with permission) — better to launch thin here than fabricated.

Either way, no development-time placeholder review content should reach the production build.

## 7. Pre-Launch Checklist

Everything below must be explicitly resolved — not left as-is — before this site goes live:

- [ ] Address, phone, email, LINE, WhatsApp replaced with real values (§2)
- [ ] Email domain is a real, monitored production address (not `.example`)
- [ ] All prices reviewed and confirmed by ODIN (§3)
- [ ] Age restrictions confirmed by ODIN (§4) — weight limits (§1) re-confirmed too, even though
      they're already treated as authoritative, since they gate real safety-relevant validation
- [ ] Restaurant menu populated with real items
- [ ] Real photography in place across gallery, hero, and activity pages
- [ ] Reviews section either removed or populated only with real, permissioned testimonials (§6)
- [ ] `/privacy` and `/terms` replaced with legally reviewed content — Thailand's PDPA at minimum,
      given the business location and data collected via the booking form; not something to launch
      on placeholder text given four languages of real visitors
- [ ] Days-closed / blackout-dates assumption (7 days/week) confirmed with ODIN
- [ ] Guest-count upper bound per booking type confirmed, or explicitly left unbounded
- [ ] Persistence + email provider chosen and provisioned with real credentials (`ARCHITECTURE.md` §15)
