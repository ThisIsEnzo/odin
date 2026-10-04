import type { BookingRequest } from "@/types/domain";
import { packages } from "@/data/odin/packages";

export interface BookingNotificationPayload {
  reference: string;
  event: "booking.received";
  booking: BookingRequest;
  text: string;
}
/** One operational representation; providers only handle transport. */
export function buildBookingNotificationPayload(booking: BookingRequest): BookingNotificationPayload {
  const lines = ["NEW BOOKING REQUEST", `Reference: ${booking.reference??booking.id}`, "Status: RECEIVED — availability not confirmed", `Locale: ${booking.locale}`,
    `Customer: ${booking.customer.name}`, `Phone: ${booking.customer.phone}`, `Email: ${booking.customer.email}`];
  if (booking.customer.preferredChannel) lines.push(`Preferred contact: ${booking.customer.preferredChannel}`, `Identity: ${booking.customer.channelIdentity ?? "see contact above"}`);
  const activity = (a: import("@/types/domain").ActivityBookingItem) => {
    lines.push(`Activity: ${a.experienceId}`, `${a.date} ${a.time} Asia/Bangkok`, `Duration: ${a.durationMinutes === undefined ? "manager to confirm" : `${a.durationMinutes} minutes`}`, `Participants: ${a.participants.length}`);
    a.participants.forEach((p,i) => { if (p.weightKg !== undefined) lines.push(`Guest ${i+1}: ${p.weightKg} kg`); });
    a.options.forEach(o => lines.push(`Option: ${o.optionId} x ${o.quantity}`));
  };
  booking.items.forEach((item,i) => {
    lines.push(`\n${i+1}. Item`);
    if (item.type === "activity") activity(item);
    else {
      const pack = packages.find(p => p.id === item.packageId);
      lines.push(`Package: ${item.packageId}`);
      if(pack?.mock.isMock) lines.push("MOCK package contents/pricing — staff must verify");
      item.components.forEach(activity);
      if(pack?.includesRestaurant) lines.push("Restaurant included — arrangements to be agreed with staff");
      item.options.forEach(o => lines.push(`Package option: ${o.optionId} x ${o.quantity}`));
    }
  });
  if (booking.estimate) {
    for (const line of booking.estimate.items) lines.push(`Estimate ${line.itemId}: ${line.amount === null ? "manager to confirm" : `${line.amount} THB`}${line.unitAmount === undefined ? "" : ` (${line.unitAmount} THB/${line.unit} × ${line.quantity})`}`);
    lines.push(`Estimated total: ${booking.estimate.amount === null ? "manager to confirm" : `${booking.estimate.amount} THB`}`, "Final price will be confirmed by our manager after reviewing the request.");
  }
  if (booking.notes) lines.push(`\nNotes: ${booking.notes}`);
  return {reference:booking.reference??booking.id,event:"booking.received",booking:structuredClone(booking),text:lines.join("\n")};
}
export interface NotificationProvider { name:string; send(payload:BookingNotificationPayload):Promise<void> }
export interface NotificationDelivery { channel:string; status:"accepted"|"failed" }
export interface NotificationService { notifyBookingReceived(booking:BookingRequest):Promise<NotificationDelivery[]> }
export class FanoutNotificationService implements NotificationService {
  constructor(private readonly providers:NotificationProvider[]) {}
  async notifyBookingReceived(booking:BookingRequest):Promise<NotificationDelivery[]> {
    const payload=buildBookingNotificationPayload(booking);
    return Promise.all(this.providers.map(async provider => {
      try { await provider.send(payload); return {channel:provider.name,status:"accepted" as const}; }
      catch { console.error("[booking:notification] failed", {reference:booking.id,channel:provider.name}); return {channel:provider.name,status:"failed" as const}; }
    }));
  }
}
export class ConsoleNotificationProvider implements NotificationProvider {
  name="console";
  async send(payload:BookingNotificationPayload) {
    // No customer contact or weights in routine logs.
    console.info("[booking:received]", {reference:payload.reference,items:payload.booking.items.length,status:"received"});
  }
}
