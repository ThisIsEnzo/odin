import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import type { ActivityBookingItem, BookingItem, ExperienceId, PackageBookingItem } from "@/types/domain";

export function createActivity(experienceId: ExperienceId, date = ""): ActivityBookingItem {
  return { id: crypto.randomUUID(), type: "activity", experienceId, date, time: "",
    participants: [{ id: crypto.randomUUID() }], options: [] };
}
export function createPackage(packageId: string, date = ""): PackageBookingItem {
  const pack = packages.find(p => p.id === packageId);
  if (!pack) throw new Error("Unknown package");
  return { id: crypto.randomUUID(), type: "package", packageId, options: [],
    components: pack.includedExperienceIds.map(id => createActivity(id, date)) };
}
export function initializeVisit(experienceId: string | null, packageId: string | null): BookingItem[] {
  const items: BookingItem[] = [];
  if (packages.some(p => p.id === packageId)) items.push(createPackage(packageId!));
  if (experiences.some(e => e.id === experienceId)) items.push(createActivity(experienceId as ExperienceId));
  return items;
}
export function activitiesOf(item: BookingItem): ActivityBookingItem[] {
  return item.type === "activity" ? [item] : item.components;
}
export function removeItem(items: BookingItem[], id: string): BookingItem[] {
  return items.filter(item => item.id !== id);
}
export function duplicateItem(item: BookingItem): BookingItem {
  const cloneActivity = (a: ActivityBookingItem): ActivityBookingItem => ({...structuredClone(a),
    id: crypto.randomUUID(), participants: a.participants.map(p => ({...p, id: crypto.randomUUID()}))});
  return item.type === "activity" ? cloneActivity(item) : {...structuredClone(item), id: crypto.randomUUID(), components: item.components.map(cloneActivity)};
}
export function updateActivity(items: BookingItem[], activity: ActivityBookingItem): BookingItem[] {
  return items.map(item => item.type === "activity" ? (item.id === activity.id ? activity : item)
    : {...item, components: item.components.map(a => a.id === activity.id ? activity : a)});
}
