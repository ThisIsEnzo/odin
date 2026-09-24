import type { BookingRequest } from "@/types/domain";

/**
 * BOOKING_RULES.md §7 — route handler logic depends only on this interface,
 * not on a specific database, so the concrete persistence provider
 * (Neon/Supabase per ARCHITECTURE.md §15) remains an infrastructure
 * decision, not an architecture one. That decision is still explicitly
 * open per IMPLEMENTATION_PLAN.md's dependency table — this phase does not
 * make it.
 */
export interface BookingRepository {
  create(request: Omit<BookingRequest, "id" | "createdAt" | "status">): Promise<BookingRequest>;
  getById(id: string): Promise<BookingRequest | null>;
}

/**
 * Development/in-memory adapter.
 *
 * KNOWN LIMITATIONS (by design, not oversights):
 * - Data does not survive a process restart.
 * - Not safe across multiple server instances/edge regions (in-memory Map
 *   is per-process).
 * - Must be replaced with a real provider before production launch per
 *   MOCK_DATA.md §7 and IMPLEMENTATION_PLAN.md's dependency table.
 *
 * Nothing outside this file should depend on it being in-memory — only on
 * the BookingRepository interface — so swapping it out later touches this
 * file and its wiring in app/api/booking/route.ts, nothing else.
 */
export class InMemoryBookingRepository implements BookingRepository {
  private readonly store = new Map<string, BookingRequest>();

  async create(
    input: Omit<BookingRequest, "id" | "createdAt" | "status">,
  ): Promise<BookingRequest> {
    const request: BookingRequest = {
      ...structuredClone(input),
      id: crypto.randomUUID(),
      status: "received", // BOOKING_RULES.md §8 — never anything else on creation
      createdAt: new Date().toISOString(),
    };
    this.store.set(request.id, request);
    return structuredClone(request);
  }

  async getById(id: string): Promise<BookingRequest | null> {
    return structuredClone(this.store.get(id) ?? null);
  }
}
