# ODIN — Booking Rules

Status: Phase 0 draft. Related: `DATA_MODEL.md` (types referenced here), `ARCHITECTURE.md` §7–8.

## 1. Booking Model: Request-to-Book

Phase 1 is **request-to-book, not instant reservation**. This is a constraint, not a limitation to
work around — the UI and copy should never imply a confirmed booking exists until ODIN staff act.

```
Select Experience → Select Date → Select Time → Guests → Conditional Requirements
   → Customer Information → Submit → Request Received → ODIN manually confirms
```

`BookingRequest.status` starts at `'received'` and is only ever moved to `'confirmed'` /
`'declined'` by a human, out of band (there is no admin UI in Phase 1 — see §7). The success
screen and confirmation email should say "request received," never "booking confirmed."

## 2. Confirmed vs. Mock Rules — what this document is allowed to assume

🔒 **Confirmed** (change requires explicit business sign-off, not just an edit to `experiences.ts`):

| Experience | Operating hours | Weight limit |
|---|---|---|
| Horse Riding | 07:00–18:00 | **90 kg max** |
| Pony Riding | 07:00–18:00 | **60 kg max** |
| ATV | 07:00–20:00 | — |
| Sauna | 08:00–21:00 | — |
| Restaurant | 07:00–23:00 | — |

🧪 **Mock** (placeholder — safe to build against, must be re-confirmed before launch): age
restrictions, all prices, package contents/prices. Full audit in `MOCK_DATA.md`.

**Weight is required only for Horse Riding and Pony Riding** (§11) — no other experience asks for
it, and the UI must not ask users for fields irrelevant to what they selected.

## 3. Field-by-Field Validation

| Field | Rule |
|---|---|
| Experience/Package | Must match a known `ExperienceId` or package `id` |
| Date | Valid calendar date, not in the past; capped at a reasonable booking window (proposed default: 90 days out — not specified in the brief, flagged as an engineering default in `MOCK_DATA.md`) |
| Time | Must fall within the selected item's `operatingHours`, aligned to its `bookingIntervalMinutes` |
| Guests | Integer ≥ 1; upper bound TBD per experience (not specified — treated as unbounded at MVP pending business input) |
| Weight | Required and validated against `restrictions.maxWeightKg` **only if** `experience.requiresWeight` |
| Customer info | Name, valid email, valid phone required; notes optional and length-capped |

## 4. Validation Architecture — one schema, two enforcement points

A single Zod schema, built from `src/data/odin/experiences.ts` rather than from hardcoded
numbers, is used both for instant client feedback and as the actual security boundary server-side.
This is what "the server must independently validate the same business rules" (§9) means in
practice: not two separately-written rule sets that could drift, but one schema imported twice.

```ts
// src/lib/validation/booking.schema.ts
import { z } from 'zod';
import { experiences } from '@/data/odin/experiences';

const experienceMap = Object.fromEntries(experiences.map((e) => [e.id, e]));

export const bookingSchema = z
  .object({
    experienceId: z.enum(experiences.map((e) => e.id) as [string, ...string[]]),
    date: z.string().date(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    guests: z.number().int().min(1),
    weightKg: z.number().positive().optional(),
    customer: z.object({
      name: z.string().min(1).max(120),
      email: z.string().email(),
      phone: z.string().min(6).max(30),
      notes: z.string().max(500).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const experience = experienceMap[data.experienceId];

    // Operating hours — re-derived from the facts layer, never trusted from the client
    if (data.time < experience.operatingHours.open || data.time >= experience.operatingHours.close) {
      ctx.addIssue({ code: 'custom', path: ['time'], message: 'Outside operating hours' });
    }

    // Conditional weight requirement — driven by data, not an "if experience === 'horse'" branch
    if (experience.requiresWeight && data.weightKg === undefined) {
      ctx.addIssue({ code: 'custom', path: ['weightKg'], message: 'Weight is required' });
    }
    const max = experience.restrictions.maxWeightKg;
    if (max && data.weightKg !== undefined && data.weightKg > max) {
      ctx.addIssue({ code: 'custom', path: ['weightKg'], message: `Maximum weight is ${max}kg` });
    }
  });
```

- **Client:** `useForm({ resolver: zodResolver(bookingSchema) })` — instant inline errors, good UX.
- **Server (`app/api/booking/route.ts`):** `bookingSchema.parse(await req.json())` — the same
  import, the actual gate. A request that skips the browser entirely (curl, a modified client, a
  bypassed form) hits exactly the same rules. Price, hours, and restrictions are never accepted
  from the request body — only re-read server-side from `experiences.ts` by `experienceId`.

## 5. Conditional Fields — pattern, not a special case

`requiresWeight` on `Experience` drives both the schema branch above and whether `BookingForm`
renders the weight input. Adding a future activity-specific requirement (the brief anticipates
this — §11: "future activity-specific requirements should be easy to add") means: add the field to
`ExperienceRestrictions`/`Experience`, add one `superRefine` branch keyed off it, add one
conditionally-rendered form field keyed off it. Nothing about the routing, the other three
experiences, or the four language files needs to change.

## 6. Anti-Spam / Rate Limiting

- **Honeypot field** on both `/api/booking` and `/api/contact` — invisible to real users, silently
  rejects bots that fill every field.
- **Basic rate limiting** per IP on both endpoints (sliding window; Upstash Redis is a natural
  pairing if hosting on Vercel, but any small store works).
- **Cloudflare Turnstile** flagged as a fast, low-friction upgrade if spam becomes a real problem
  post-launch — not built at MVP since there's no evidence yet it's needed (§34, avoid
  overengineering).

## 7. Persistence & Notification — abstracted, infra decision deferred

```ts
// src/lib/booking/repository.ts
export interface BookingRepository {
  create(request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<BookingRequest>;
  getById(id: string): Promise<BookingRequest | null>;
}

// src/lib/booking/notify.ts
export interface NotificationService {
  notifyBusiness(request: BookingRequest): Promise<void>;   // → ODIN's contact email (MOCK, see MOCK_DATA.md)
  notifyCustomer(request: BookingRequest): Promise<void>;   // optional acknowledgement to the guest
}
```

Route handler logic depends only on these two interfaces, not on a specific database or email
provider — so the actual choice (Neon/Supabase for persistence, Resend/Postmark for email; see
`ARCHITECTURE.md` §15) can be made later, or a local/in-memory adapter can stand in through
development, without touching validation or UI code once written.

## 8. Status Lifecycle

```
received  ──(ODIN staff, manually, out of band)──▶  confirmed
   │                                                    
   └────────────────────────────────────────────────▶  declined
                                                          
(any state) ─────────────────────────────────────────▶  cancelled
```

No code path in Phase 1 sets `status` to anything other than `'received'` on creation. There is no
admin UI to change status yet (explicitly Phase 2 territory — "advanced booking administration" is
listed as deferred) — status transitions happen directly against the data store until then. Worth
naming as a known limitation rather than a bug: double-booking is possible until a human confirms,
which is inherent to request-to-book and accepted by the brief, not something this architecture is
expected to prevent.

## 9. What this deliberately does not do (Phase 2, out of scope)

Real-time availability checking, automatic confirmation, payment collection, and a booking admin
dashboard are all explicitly deferred per §13 of the brief. The `BookingRequest` shape and the
repository interface are designed so a future availability engine or CRM can consume the same data
without a redesign — but none of that is built now.
