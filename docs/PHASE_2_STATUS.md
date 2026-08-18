# Phase 2 Status

Recovery/status document written after a fresh, independent inspection of
`/home/claude/odin-web/` in this session — not from memory of what an earlier session intended
to do. Every claim below was checked against the files on disk (see "Static Verification
Performed"); nothing here is inferred from the task description alone.

## Completed

- **Centralized data layer** — `src/data/odin/{site,experiences,packages,restaurant,gallery,faq,reviews}.ts`
  all exist, are non-empty, and type against `src/types/domain.ts`.
- **Confirmed business rules represented exactly**: Horse Riding 07:00–18:00 / maxWeightKg 90;
  Pony Riding 07:00–18:00 / maxWeightKg 60; ATV 07:00–20:00; Sauna 08:00–21:00; Restaurant
  07:00–23:00 — all verified byte-for-byte against `CLAUDE.md` §6/§9/§10.
- **Mock vs. confirmed vs. not-yet-defined distinction** — implemented via a per-field `mock` /
  `MockFlag` structure in the data files (e.g. `experience.mock.price.isMock`), plus explicit code
  comments on fields that aren't even mocked yet (e.g. `restaurant.ts` `cuisineTags: []`). The
  canonical registry of what's real/mock/undefined remains `docs/MOCK_DATA.md`, which the data
  files reference rather than duplicate.
- **`reviews.ts` is intentionally empty** — no fabricated testimonials; comment explicitly
  references the no-fabrication instruction and `MOCK_DATA.md` §6.
- **i18n** — `messages/{en,th,ru,zh}.json` all present, all valid JSON, all with **identical**
  key structure (verified programmatically, see below). Namespaces: `meta`, `common`, `nav`,
  `footer`, `home`, `experiences`, `notFound`, `error`, `restaurant`, `packages`, `gallery`,
  `faq`, `booking.errors`. Default locale is `en` (`src/i18n/routing.ts`).
- **Business rule functions** — `src/lib/booking/rules.ts` implements exactly the three named
  functions from the brief: `isTimeWithinOperatingHours()`, `validateExperienceRestrictions()`,
  `validateBookingRequest()`. Pure TypeScript — no React, no Zod, no Next.js import. Every
  returned issue carries a `messageKey` into `messages/*.json` rather than a hardcoded string.
- **Operating-hours boundary semantics chosen and documented**: `open` inclusive, `close`
  exclusive. Recorded in three places consistently — the doc comment on
  `isTimeWithinOperatingHours()`, `docs/BOOKING_RULES.md` §2a, and the unit tests.
- **Unit tests** — `tests/unit/booking-rules.test.ts` covers all nine cases listed in the brief
  (horse 90kg valid / 91kg invalid, pony 60kg valid / 61kg invalid, horse 07:00 valid, horse
  18:00 invalid under the chosen semantics, horse time outside range invalid, ATV outside
  07:00–20:00 invalid, sauna outside 08:00–21:00 invalid), plus a data-integrity guard on the two
  confirmed numbers and several `validateBookingRequest()` end-to-end cases.
- **Vitest configured** — `vitest.config.ts` exists, sets `environment: 'node'`, resolves the
  `@/` alias to `src/`, and points at `tests/**/*.test.ts`. `package.json` already had
  `"test": "vitest run"` and `vitest` as a devDependency from Phase 1.
- **`docs/BOOKING_RULES.md` updated** — §2a added (boundary decision); §4 rewritten so the
  documented Zod plan (Phase 4, not yet built) wraps `rules.ts` instead of re-implementing the
  same checks inline, which was the original Phase 0 sketch and would have duplicated the rules
  the brief explicitly says not to duplicate.
- **Business rules are not coupled to any UI** — nothing in `src/components/` or `src/app/`
  imports from `src/lib/booking/`; the only consumer today is the test file.

## Partially Completed

Nothing found partially written, truncated, or structurally broken — see Static Verification
Performed below. The one item that's intentionally partial rather than incomplete:

- **`validateExperienceRestrictions()` covers weight only, not age.** `ExperienceRestrictions`
  carries `minAge`/`maxAge`, but the current `BookingRequest`/`BookingValidationInput` shape has
  no age or birthdate field to check it against — age restrictions are informational (shown on
  the experience page) rather than enforced, since the booking flow doesn't collect an age input
  at all yet. This is documented in a comment on the function itself. Extending it is
  straightforward if a future phase adds an age field, but it isn't done now because there's
  nothing to validate against.

## Missing

Nothing that was in scope for Phase 2's task list is missing. Two adjacent things exist as
documented, deliberate deferrals (not oversights), both already noted in `docs/`:

- No booking UI, API route, or Zod schema yet — that's Phase 4 per `IMPLEMENTATION_PLAN.md`, and
  `docs/BOOKING_RULES.md` §4 already sketches how it will call into `rules.ts` rather than
  duplicate it.
- No available-time-slot generator (a helper that would use `bookingIntervalMinutes` to offer
  only valid start times in a UI, so a guest is never offered "18:00" in the first place) —
  flagged as a natural near-term addition in `docs/BOOKING_RULES.md` §2a, not built since nothing
  consumes it without a booking UI.

## Static Verification Performed

All of the following were actually run in this session against the files on disk (not asserted
from memory):

1. **JSON validity** — `python3 -c "json.load(...)"` on all four `messages/*.json` files: all
   parse successfully.
2. **Locale key parity** — programmatic diff of top-level *and* fully flattened (nested) keys
   across `en`/`th`/`ru`/`zh`: zero differences in either direction, for all locales.
3. **Data → i18n reference resolution** — every `translationNamespace` / `altTranslationKey`
   string found in `src/data/odin/*.ts` (16 references) was resolved against `messages/en.json`:
   all 16 resolve to a real node in the message tree.
4. **Business-rule → i18n reference resolution** — every `messageKey` string in
   `src/lib/booking/rules.ts` (8 references) was resolved against `messages/en.json`: all 8
   resolve to an actual string value.
5. **Import resolution, whole `src/` tree** — every `@/...`, `./...`, and `../...` import
   specifier across all `.ts`/`.tsx` files under `src/` (52 specifiers across 29 files) was
   checked against the filesystem: all resolve to a real file.
6. **Third-party package cross-check** — every non-relative import in `src/` and `tests/`
   (`next`, `next-intl`, `react`, `clsx`, `tailwind-merge`, `@radix-ui/react-dialog`,
   `lucide-react`, `vitest`) is declared in `package.json`; nothing imported is undeclared.
7. **Bracket/brace/paren balance** — crude structural sanity check on the three new files
   (`rules.ts`, `booking-rules.test.ts`, `vitest.config.ts`): all balanced.
8. **Secrets scan** — grepped new files and all message catalogs for common secret patterns
   (API-key-shaped strings, hardcoded passwords): none found.
9. **TODO/FIXME scan** — grepped `src/` and `tests/`: no stray markers left behind.
10. **File-size/truncation check** — listed every project file with byte size: no zero-byte or
    suspiciously small files among files that should have real content.

## Runtime Verification Required

None of the following were executed in this session — this environment has no terminal access to
npm, Vitest, `tsc`, ESLint, or a Next.js runtime, and nothing below should be read as having been
run:

- `npm install` (dependency resolution has never actually been attempted against the real npm
  registry from this project's `package.json`)
- `tsc --noEmit` (TypeScript type-checking — the checks above are structural/textual, not a real
  compile; the `noUncheckedIndexedAccess` flag in `tsconfig.json` in particular hasn't been
  verified against the actual code)
- `vitest run` (none of the 20 assertions in `tests/unit/booking-rules.test.ts` have actually
  been executed — their correctness rests on manual reasoning and the static checks above, not on
  a passing test run)
- `next build` / `next dev` (no verification that the app boots, that `next-intl`'s `proxy.ts` /
  `i18n/request.ts` wiring behaves as documented at runtime, or that any page renders)
- `eslint .` (lint config exists but has never been run against this codebase)

These should be run in a real Node environment (local machine, CI, or Claude Code with network
access) before this is treated as verified rather than carefully-reasoned-but-unexecuted code.

## Known Issues

- **Timezone handling in date validation is a known simplification.** `isValidFutureDate()` in
  `rules.ts` compares against server-local "today"; ODIN operates on Thailand time (ICT, UTC+7),
  and a booking made late at night on a server in a different timezone could land on the wrong
  side of the boundary. Flagged in a code comment; not fixed, since it needs a real
  timezone-aware date check (e.g. `Temporal` or a small date library) and doesn't affect Phase 2's
  actual deliverables.
- **`noUncheckedIndexedAccess: true`** is set in `tsconfig.json` (from Phase 1) but has never been
  checked with a real compiler against the code written in Phase 2 — see Runtime Verification
  Required.
- **`docs/QA_REPORT.md`**, referenced in `CLAUDE.md` §32's documentation list, does not exist yet
  — expected; it's a later-phase (QA/launch) artifact, not a Phase 2 gap.
