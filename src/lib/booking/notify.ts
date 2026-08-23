import type { BookingRequest } from "@/types/domain";

/**
 * BOOKING_RULES.md §7 — abstracted so the real transactional email provider
 * (Resend/Postmark per ARCHITECTURE.md §15) is an infrastructure choice
 * made later, not something route/validation code needs to know about.
 *
 * notifyCustomer is an acknowledgement only — it must never say a booking
 * is "confirmed" (BOOKING_RULES.md §1): status is and stays "received"
 * until ODIN staff act, out of band.
 */
export interface NotificationService {
  notifyBusiness(request: BookingRequest): Promise<void>;
  notifyCustomer(request: BookingRequest): Promise<void>;
}

/**
 * Development adapter — logs instead of sending real email/LINE/WhatsApp.
 * ARCHITECTURE.md §15 flags that ODIN's real day-to-day channels are
 * phone/LINE/WhatsApp, not email; that integration decision is explicitly
 * deferred and not made here. This adapter exists only so M4 development
 * isn't blocked on it.
 */
export class ConsoleNotificationService implements NotificationService {
  async notifyBusiness(request: BookingRequest): Promise<void> {
    console.log("[notify:business] new booking request received", {
      id: request.id,
      type: request.type,
      experienceOrPackageId: request.experienceOrPackageId,
      date: request.date,
      time: request.time,
      guests: request.guests,
    });
  }

  async notifyCustomer(request: BookingRequest): Promise<void> {
    console.log("[notify:customer] acknowledgement queued (request received, not confirmed)", {
      id: request.id,
      locale: request.locale,
    });
  }
}
