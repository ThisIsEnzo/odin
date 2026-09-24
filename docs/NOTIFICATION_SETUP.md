# LINE / WhatsApp notification setup

## Evidence and status

Code implemented; external account setup required; LIVE DELIVERY NOT VERIFIED. No credentials or staff destinations were supplied and no messages were sent. HTTP providers are tested using mocked responses. Approved provider settings must be verified by the operator before enabling production.

Official documentation checked during Phase 5C (2026-09-24):

- LINE push API: https://developers.line.biz/en/reference/messaging-api/#send-push-message
- LINE retry behavior: https://developers.line.biz/en/docs/messaging-api/retrying-api-request/
- LINE source IDs: https://developers.line.biz/en/docs/messaging-api/getting-user-ids/
- Meta components: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/
- Meta utility templates: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/utility-templates/utility-templates
- Meta Message API: https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-phone-number/message-api
- Meta's official request collection: https://www.postman.com/meta/whatsapp-business-platform/request/13382743-7208d966-6a1f-4980-ad87-7d21c80e5a8d
- WhatsApp proactive messaging/opt-in: https://business.whatsapp.com/products/business-platform-features
- Service window: https://business.whatsapp.com/products/platform-pricing

Direct retrieval of some Meta documentation returned HTTP 429. Relevant official indexed excerpts and Meta's official collection confirmed template endpoint/components; this is not a claim of exhaustive account-specific policy verification. Review current account rules and exact approved template before launch. Staff-alert template classification/approval must come from Meta, not this code.

## Shared contract

Booking domain → `buildBookingNotificationPayload` → frozen per-part delivery plans → official HTTP transport. Providers do not reinterpret packages, weights or booking rules. The full operational text includes public reference, customer/contact, every activity/component/date/time/count/weight, options, notes and received status. No internal database IDs appear in outgoing text. Long content is split without truncating details; each part carries reference and numbering. Data in the canonical DB snapshot is authoritative.

Production transport is `outbox/transport.ts`; Phase 5B direct provider convenience classes remain for compatibility/tests and are NOT wired into the production API. Durable deliveries are created in the booking transaction. See PRODUCTION_BACKEND_SETUP.md for processing, retries and failure semantics.

## LINE Official Account / Messaging API

1. Create/use the ODIN LINE Official Account, enable Messaging API and manage its channel in LINE Developers.
2. Issue the appropriate channel access token; store it only as `LINE_CHANNEL_ACCESS_TOKEN`.
3. Choose the intended staff user or group. A staff user should add the Official Account as a friend. For groups enable bot group joining and add the bot to the intended staff group, respecting LINE's current group restrictions.
4. Obtain a real user ID from LINE Developers for your own staff account, or from the source of a verified Messaging API webhook event. Group IDs come from group-source events. User IDs are provider-scoped; do not copy an ID from an unrelated provider/channel. Configure the exact ID in `LINE_STAFF_RECIPIENT_ID` (comma-separated, at most 10, deduplicated). A single staff group is simplest.
5. Enable `BOOKING_NOTIFICATION_CHANNELS=line` (or `line,whatsapp` after both are ready).

Outgoing push delivery requires no webhook, so this project intentionally exposes none. If a webhook is used externally to discover group IDs, use LINE's official SDK/example receiver with raw-body HMAC-SHA256 signature verification and constant-time comparison before trusting source IDs. Keep `LINE_CHANNEL_SECRET` in that receiver's server-only secret store; it is not needed or consumed by this outgoing-only project. Never paste unsigned event IDs into production on trust alone. No chatbot, automatic replies or LINE Notify exists here.

Push requests use `POST https://api.line.me/v2/bot/message/push`, bearer authorization and `X-Line-Retry-Key`. Each durable part sends one text message under the platform limit. The same UUID, recipient and body are reused for retries; HTTP 409 with `x-line-accepted-request-id` is accepted as prior success. A random new key is not generated on each retry. The local deadline is 23h from outbox creation; LINE documents a 24h retry-key window from first request. Acceptance does not guarantee recipient delivery (e.g. blocking).

## WhatsApp Business Platform / Cloud API

1. Set up the authorized Meta business portfolio/app, WhatsApp Business Account and registered business phone number using official onboarding. Complete account/number verification required by Meta.
2. Use an appropriate system-user/access token with current required WhatsApp permissions. Store it as `WHATSAPP_ACCESS_TOKEN`, phone-number ID as `WHATSAPP_PHONE_NUMBER_ID`.
3. Choose a currently supported Graph version from Meta for your account and explicitly set `WHATSAPP_GRAPH_API_VERSION` (format `vNN.N`). No version or phone ID is invented as a production default.
4. Obtain and retain each staff recipient's opt-in for these alerts. Set `WHATSAPP_STAFF_RECIPIENT` to international digits, without `+`; comma-separated individual numbers, at most 10. This implementation does not claim WhatsApp group messaging support.
5. Submit the proposed template below, including realistic sample parameters, through WhatsApp Manager/API. Await actual approval and confirm category, exact name, locale and structure. Set `WHATSAPP_TEMPLATE_NAME` and `WHATSAPP_TEMPLATE_LANGUAGE` to that approved template. Set `WHATSAPP_STAFF_OPT_IN_CONFIRMED=1` only after opt-in and template verification.
6. Enable the whatsapp channel. Test with one explicitly authorized recipient before adding more.

Proactive alerts use approved templates, not an assumed open 24-hour customer-service window or arbitrary free-form messages. No unofficial WhatsApp package, Web session, QR login or browser automation is involved.

### Proposed template specification — not approved

A text BODY only, three positional parameters, no header/footer/buttons. Suggested content to submit (operator chooses an actual name):

> ODIN staff booking request. Reference: {{1}}. Details part {{2}}: {{3}}. Status: REQUEST RECEIVED. Availability is not confirmed; please review and contact the guest.

- `{{1}}`: public ODIN reference (37 characters with current format).
- `{{2}}`: part/total, e.g. `1/2`.
- `{{3}}`: canonical operational details, whitespace-normalized and split at 700 UTF-16 code units. No newline/tab parameter injection.

This fixed text and parameter budget conservatively stay below 1024 characters per rendered body. Do not substitute a longer/different template without adapting and testing the budget. The submitted examples should show name/contact, an activity with date/time/count and weights, package context and notes. Declare the staff operational-alert purpose truthfully; do not label it as an approved utility template without Meta's decision. Approval of a mostly variable operational detail body is not guaranteed. If rejected, leave WhatsApp disabled and revise the reviewed template specification/code; LINE may operate independently.

The provider sends `POST https://graph.facebook.com/{version}/{phone-number-id}/messages`, `messaging_product=whatsapp`, `type=template`, configured name/language and the three BODY text parameters. Every part is queued separately, with provider message ID persisted on acceptance. Multipart alerts have per-message costs/limits; staff should match reference/part numbers. No delivery/read status webhook or automatic opt-out ingestion is implemented. Review Meta account quality, messaging limits, pricing and recipient consent operationally.

## Explicit live test procedure

Automated tests NEVER send real messages. To send ONE clearly marked synthetic alert:

1. Configure one channel and one authorized ODIN test/staff destination only, with real approved credentials/template. Export the environment; CLI scripts do not auto-load Next's .env.local.
2. Run `npm run backend:check`.
3. Explicitly authorize the test in your environment and execute:

```sh
LIVE_NOTIFICATION_TEST=1 npm run notifications:test:live
```

The script refuses multiple recipients/channels and multi-part test messages, uses synthetic TEST data and no database writes, and reports only reference/provider/message ID. Do not run it repeatedly to probe delivery. Remove the flag after the test. API acceptance is not enough: confirm with staff that it arrived and record acceptance/recipient verification separately. Real delivery has NOT been verified in this phase.
