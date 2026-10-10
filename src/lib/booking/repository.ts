import {calculateBookingEstimate} from "./pricing";
import {bookingReference,fingerprint,IdempotencyConflict} from "./idempotency";
import {calculateRequestEstimate} from "./request";
import type { BookingRequest, BookingDraft, BookingRequestDraft, BookingRequestV3, StoredBookingRequest, SupportedBookingDraft } from "@/types/domain";

/** Versioned repository boundary. PostgreSQL is production; memory is test/dev only. */
export interface CreateBookingOptions { idempotencyKey?: string }
export interface BookingRepository {
  create(request: BookingRequestDraft, options?:CreateBookingOptions): Promise<BookingRequestV3>;
  create(request: BookingDraft, options?:CreateBookingOptions): Promise<BookingRequest>;
  getById(id: string): Promise<StoredBookingRequest | null>;
}

/** Volatile isolated adapter. Runtime configuration forbids this in production. */
export class InMemoryBookingRepository implements BookingRepository {
  private readonly keys=new Map<string,{hash:string;id:string}>();
  private readonly store = new Map<string, StoredBookingRequest>();

  create(input: BookingRequestDraft, options?:CreateBookingOptions): Promise<BookingRequestV3>;
  create(input: BookingDraft, options?:CreateBookingOptions): Promise<BookingRequest>;
  async create(input: SupportedBookingDraft, options?:CreateBookingOptions): Promise<StoredBookingRequest> {
    const key=options?.idempotencyKey,hash=fingerprint(input);
    const existing=key?this.keys.get(key):undefined;
    if(existing){if(existing.hash!==hash)throw new IdempotencyConflict();return (await this.getById(existing.id))!;}
    const request = {
      ...structuredClone(input),
      estimate: input.schemaVersion === 3 ? calculateRequestEstimate(input) : calculateBookingEstimate(input.items),
      id: crypto.randomUUID(),
      reference:bookingReference(),
      status: "received" as const, // BOOKING_RULES.md §8 — never anything else on creation
      createdAt: new Date().toISOString(),
    };
    this.store.set(request.id, request);
    if(key)this.keys.set(key,{hash,id:request.id});
    return structuredClone(request);
  }

  async getById(id: string): Promise<StoredBookingRequest | null> {
    return structuredClone(this.store.get(id) ?? null);
  }
}
