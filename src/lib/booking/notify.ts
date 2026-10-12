import { experiences } from "@/data/odin/experiences";
import messages from "../../../messages/en.json";
import type { StoredBookingRequest } from "@/types/domain";
import { packages } from "@/data/odin/packages";

export interface BookingNotificationPayload {
  reference: string;
  event: "booking.received";
  booking: StoredBookingRequest;
  text: string;
}
/** One operational representation; providers only handle transport. */
export function buildBookingNotificationPayload(booking: StoredBookingRequest): BookingNotificationPayload {
  const lines = ["NEW BOOKING REQUEST", `Reference: ${booking.reference??booking.id}`, "Status: RECEIVED — availability not confirmed", `Locale: ${booking.locale}`,
    `Customer: ${booking.schemaVersion===3?booking.customer.fullName:booking.customer.name}`, `Phone: ${booking.customer.phone}`, `Email: ${booking.customer.email}`];
  if (booking.schemaVersion===2 && booking.customer.preferredChannel) lines.push(`Preferred contact: ${booking.customer.preferredChannel}`, `Identity: ${booking.customer.channelIdentity ?? "see contact above"}`);
  const activity = (a: import("@/types/domain").ActivityBookingItem) => {
    lines.push(`Activity: ${a.experienceId}`, `${a.date} ${a.time} Asia/Bangkok`, `Duration: ${a.durationMinutes === undefined ? "manager to confirm" : `${a.durationMinutes} minutes`}`, `Participants: ${a.participants.length}`);
    a.participants.forEach((p,i) => { if (p.weightKg !== undefined) lines.push(`Guest ${i+1}: ${p.weightKg} kg`); });
    a.options.forEach(o => lines.push(`Option: ${o.optionId} x ${o.quantity}`));
  };
  if (booking.schemaVersion === 3) {
    lines.push(`Visit date: ${booking.visitDate}`, `Preferred arrival time: ${booking.preferredStartTime} Asia/Bangkok`, "Exact activity timing will be confirmed by our manager.");
    const textAt = (key: string) => key.split('.').reduce<unknown>((value, part) => value && typeof value==='object' ? (value as Record<string,unknown>)[part] : undefined, messages);
    for(const pack of booking.estimate.packages??[]) {
      const title=textAt(`${pack.translationNamespace}.title`);
      lines.push(`Package: ${typeof title==='string'?title:pack.packageId}`,`Package ID: ${pack.packageId}`,`Pricing model: ${pack.pricingMode}`);
      for(const component of pack.components) {
        const activity=experiences.find(e=>e.id===component.activityId);
        const name=activity?textAt(`${activity.translationNamespace}.title`):component.activityId;
        lines.push(`Included: ${name}`,`Guests: ${component.guestCount}`,`Duration: ${component.durationMinutes===undefined?'manager to confirm':`${component.durationMinutes} minutes`}`);
        if(component.unitCount!==undefined)lines.push(`ATVs: ${component.unitCount}`);
      }
      lines.push(`Package subtotal: ${pack.amount===null?'manager to confirm':`${pack.amount} THB`}`);
    }
    booking.activities.forEach((selection, index) => {
      const activity = experiences.find(e => e.id === selection.activityId);
      const title = activity ? textAt(`${activity.translationNamespace}.title`) : undefined;
      lines.push(`\n${index+1}. ${typeof title==='string'?title:selection.activityId}`, `Guests: ${selection.guestCount}`, `Duration: ${selection.durationMinutes===undefined?'manager to confirm':`${selection.durationMinutes} minutes`}`);
      if (activity?.restrictions.maxWeightKg !== undefined) lines.push(`Maximum rider weight: ${activity.restrictions.maxWeightKg} kg`);
      if (selection.unitCount !== undefined) {
        const unit = activity?.booking?.model === 'capacity_unit' ? textAt(activity.booking.unitTranslationKey) : undefined;
        lines.push(`Units (${typeof unit==='string'?unit:'vehicles'}): ${selection.unitCount}`);
        if (activity?.booking?.model==='capacity_unit') lines.push(`Up to ${activity.booking.maxGuestsPerUnit} guests per unit`);
      }
    });
  } else booking.items.forEach((item,i) => {
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
    for (const line of booking.estimate.items) {if(line.occupancy)lines.push(`ATV occupancy: ${line.occupancy.shared} shared × ${line.occupancy.sharedAmount} THB + ${line.occupancy.solo} solo × ${line.occupancy.soloAmount} THB`);lines.push(`Estimate ${line.itemId}: ${line.amount === null ? "manager to confirm" : `${line.amount} THB`}${line.unitAmount === undefined ? "" : ` (${line.unitAmount} THB/${line.unit} × ${line.quantity})`}`);}
    for(const discount of booking.estimate.packageDiscounts??[]) {
      lines.push(`Package discount: ${discount.benefit.type==='percentage'?`${discount.benefit.basisPoints/100}%`:discount.labels.en}`,`Package discount ID: ${discount.id}; status: ${discount.status}`,`Package deduction: ${discount.discountAmount===null?'manager to confirm':`−${discount.discountAmount} THB`}`);
    }
    if (booking.estimate.promotions) {
      // Presentation only: use frozen results, never evaluate config/eligibility here.
      const snapshot = booking.estimate.promotions;
      const pending = snapshot.pricingStatus === 'PENDING' || snapshot.amountMinor === null;
      lines.push(pending ? 'PRICING: Manager to confirm' : `Subtotal: ${snapshot.subtotalAmount} THB`);
      for (const promotion of snapshot.appliedPromotions) {
        const status = promotion.status ?? (promotion.discountMinor === null ? 'ELIGIBLE' : 'APPLIED');
        const benefit = promotion.benefit.type === 'percentage'
          ? `${promotion.benefit.basisPoints / 100}%`
          : `${promotion.benefit.amountMinor / 100} THB fixed discount`;
        lines.push(`${status === 'APPLIED' ? 'APPLIED PROMOTION' : 'PROMOTION MATCHED (ELIGIBLE)'}: ${promotion.labels.en} · ${benefit}`,
          `Promotion ID: ${promotion.id}; scope: ${promotion.scope}`);
        if (!pending && promotion.discountAmount !== null) lines.push(`Discount: −${promotion.discountAmount} THB`);
        else if (status === 'ELIGIBLE') lines.push(`Manager note: Apply the eligible ${benefit} offer to the ${promotion.scope} scope when confirming the final quote; final discount amount requires confirmation.`);
        else lines.push('Manager note: Retain this already-applied scoped offer when confirming remaining pricing. The whole-booking discount and total remain pending; do not apply twice.');
      }
      lines.push(`Calculation: ${snapshot.calculationVersion}; config: ${snapshot.configurationVersion}${snapshot.calculatedAt ? `; evaluated at: ${snapshot.calculatedAt}` : ''}`);
    }
    const finalAmount = booking.estimate.promotions ? booking.estimate.promotions.amount : booking.estimate.amount;
    lines.push(`Estimated total: ${finalAmount === null ? "manager to confirm" : `${finalAmount} THB`}`, "Final price and availability require manager confirmation. This estimate is not a confirmed customer charge.");
  }
  if (booking.notes) lines.push(`\nNotes: ${booking.notes}`);
  return {reference:booking.reference??booking.id,event:"booking.received",booking:structuredClone(booking),text:lines.join("\n")};
}
export interface NotificationProvider { name:string; send(payload:BookingNotificationPayload):Promise<void> }
export interface NotificationDelivery { channel:string; status:"accepted"|"failed" }
export interface NotificationService { notifyBookingReceived(booking:StoredBookingRequest):Promise<NotificationDelivery[]> }
export class FanoutNotificationService implements NotificationService {
  constructor(private readonly providers:NotificationProvider[]) {}
  async notifyBookingReceived(booking:StoredBookingRequest):Promise<NotificationDelivery[]> {
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
    console.info("[booking:received]", {reference:payload.reference,items:payload.booking.schemaVersion===3?payload.booking.activities.length:payload.booking.items.length,status:"received"});
  }
}
