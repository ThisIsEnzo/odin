# ODIN — Phase 5C

Existing Phase 5A.1 frontend and Booking V2, with PostgreSQL/Drizzle persistence, idempotency and transactional notification outbox.

- Start here: [Production backend setup](docs/PRODUCTION_BACKEND_SETUP.md)
- Channels: [LINE / WhatsApp setup](docs/NOTIFICATION_SETUP.md)
- Evidence / limitations: [Phase 5C status](docs/PHASE_5C_STATUS.md)

`npm ci`, then `npm test` and `npm run typecheck`. Frontend-only development: explicitly set `BOOKING_STORAGE=memory`, `BOOKING_NOTIFICATION_CHANNELS=console`, then `npm run dev`. For durable development or production follow the setup guide and apply committed migrations. Production never falls back to memory.

Real PostgreSQL and live notification verification remain required before launch. No CRM, admin, payment or instant confirmation is included.
