import {calculateBookingEstimate} from "./pricing";
import {bookingReference,fingerprint,IdempotencyConflict} from "./idempotency";
import type { BookingRequest } from "@/types/domain";

/**
 * BOOKING_RULES.md §7 — route handler logic depends only on this interface,
 * not on a specific database, so the concrete persistence provider
 * (Neon/Supabase per ARCHITECTURE.md §15) remains an infrastructure
 * decision, not an architecture one. That decision is still explicitly
 * open per IMPLEMENTATION_PLAN.md's dependency table — this phase does not
 * make it.
 */
export interface CreateBookingOptions { idempotencyKey?: string }
export interface BookingRepository {
  create(request: Omit<BookingRequest, "id" | "createdAt" | "status">, options?:CreateBookingOptions): Promise<BookingRequest>;
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
  private readonly keys=new Map<string,{hash:string;id:string}>();
  private readonly store = new Map<string, BookingRequest>();

  async create(
    input: Omit<BookingRequest, "id" | "createdAt" | "status">,
    options?:CreateBookingOptions,
  ): Promise<BookingRequest> {
    const key=options?.idempotencyKey,hash=fingerprint(input);
    const existing=key?this.keys.get(key):undefined;
    if(existing){if(existing.hash!==hash)throw new IdempotencyConflict();return (await this.getById(existing.id))!;}
    const request: BookingRequest = {
      ...structuredClone(input),
      estimate: calculateBookingEstimate(input.items),
      id: crypto.randomUUID(),
      reference:bookingReference(),
      status: "received", // BOOKING_RULES.md §8 — never anything else on creation
      createdAt: new Date().toISOString(),
    };
    this.store.set(request.id, request);
    if(key)this.keys.set(key,{hash,id:request.id});
    return structuredClone(request);
  }

  async getById(id: string): Promise<BookingRequest | null> {
    return structuredClone(this.store.get(id) ?? null);
  }
}
