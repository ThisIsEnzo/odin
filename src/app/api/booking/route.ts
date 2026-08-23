import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/booking.schema";
import { InMemoryBookingRepository } from "@/lib/booking/repository";
import { ConsoleNotificationService } from "@/lib/booking/notify";
import type { BookingRequest } from "@/types/domain";

/**
 * POST /api/booking — ARCHITECTURE.md §8, BOOKING_RULES.md §1/§4.
 *
 * This is the real security boundary: the same bookingSchema import used
 * for client-side zodResolver feedback is parsed again here against the
 * raw request body. Hours, price, and restrictions are never accepted from
 * the client — only the client's *selections* — and are re-derived from
 * src/data/odin/experiences.ts on every request.
 *
 * Module-level singletons are fine for a single-process in-memory adapter;
 * a real persistence/notification provider (ARCHITECTURE.md §15, still an
 * open decision) will replace this wiring, not extend it.
 */
const repository = new InMemoryBookingRepository();
const notifications = new ConsoleNotificationService();

// Generic, non-revealing client-facing error text per ARCHITECTURE.md §12 —
// full detail is logged server-side only.
const GENERIC_ERROR = "Something went wrong — please try again or contact us directly.";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    // Field-level messages are fine to return (they mirror what the future
    // BookingForm already showed the user via the same schema); no internal
    // detail (stack traces, persistence errors) is ever included here.
    return NextResponse.json(
      { error: "Some details need attention.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { company: _honeypot, ...validated } = parsed.data;

  try {
    const created: BookingRequest = await repository.create({
      type: "experience",
      experienceOrPackageId: validated.experienceId,
      date: validated.date,
      time: validated.time,
      guests: validated.guests,
      weightKg: validated.weightKg,
      customer: validated.customer,
      locale: validated.locale,
    });

    await notifications.notifyBusiness(created);
    await notifications.notifyCustomer(created);

    // Never "confirmed" — BOOKING_RULES.md §1/§8. Only ODIN staff move this
    // out of "received", manually, out of band.
    return NextResponse.json({ status: "received", id: created.id }, { status: 201 });
  } catch (err) {
    console.error("[api/booking] failed", err);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
