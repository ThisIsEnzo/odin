import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import type { ActivityBookingItem, BookingItem, BookingEstimate, EstimateLine, Experience, Package } from "@/types/domain";

/** Unknown is null, never zero or a misleading partial grand total. */
export function calculateActivityEstimate(item: ActivityBookingItem, catalog: Experience[] = experiences): EstimateLine {
  const unknown: EstimateLine = {itemId:item.id, amount:null, ...(item.durationMinutes === undefined ? {} : {durationMinutes:item.durationMinutes})};
  const tier = catalog.find(e => e.id === item.experienceId)?.durationOptions?.find(t => t.durationMinutes === item.durationMinutes);
  if (!tier || item.options.length || !item.participants.length || !Number.isFinite(tier.price.amount) || tier.price.amount < 0 || tier.price.currency !== "THB") return unknown;
  const quantity = tier.quantityBasis === "participant" ? item.participants.length : tier.quantityBasis === "booking" ? 1 : null;
  if (quantity == null) return unknown;
  return {...unknown, amount: Math.round(tier.price.amount * 100) * quantity / 100, unitAmount:tier.price.amount, quantity, unit:tier.price.unit};
}
export function calculateBookingEstimate(items: BookingItem[], catalog: Experience[] = experiences, packageCatalog: Package[] = packages): BookingEstimate {
  const lines = items.map((item): EstimateLine => {
    if (item.type === "activity") return calculateActivityEstimate(item,catalog);
    const pack = packageCatalog.find(p => p.id === item.packageId);
    const unknown: EstimateLine = {itemId:item.id,amount:null};
    if (!pack || pack.mock.isMock || !pack.estimateBasis || item.options.length || item.components.some(c => c.options.length) || !Number.isFinite(pack.price.amount) || pack.price.amount < 0 || pack.price.currency !== "THB") return unknown;
    // Per-person packages require a coherent shared headcount; otherwise staff must quote.
    const counts = item.components.map(c => c.participants.length);
    const quantity = pack.estimateBasis === "package" ? 1 : counts.length && counts.every(n => n > 0 && n === counts[0]) ? counts[0] : null;
    if (quantity == null) return unknown;
    return {itemId:item.id, amount:Math.round(pack.price.amount * 100) * quantity / 100,unitAmount:pack.price.amount,quantity,unit:pack.price.unit};
  });
  return {version:1,currency:"THB",amount:lines.length && lines.every(l => l.amount !== null) ? lines.reduce((sum,l) => sum + Math.round(l.amount! * 100),0) / 100 : null,items:lines};
}
