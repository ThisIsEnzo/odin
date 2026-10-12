import { z } from "zod";
import {promotionConfig} from "@/data/odin/promotions";
import {calculatePromotions, moneyToMinor, type PromotionConfig} from "./promotions";
import {packages} from "@/data/odin/packages";
import type {Package, BookingPackageSelection, PackageEstimateLine} from "@/types/domain";
import { experiences } from "@/data/odin/experiences";
import { siteConfig } from "@/data/odin/site";
import type { BookingActivitySelection, BookingEstimate, BookingRequestDraft, Experience } from "@/types/domain";
import { isValidTimeFormat, maxBookingDate, thailandToday } from "./rules";

/** Technical payload limit; not an asserted business capacity. */
export const MAX_REQUEST_GUESTS = 200;
export function unitBounds(guestCount: number, maxGuestsPerUnit: number) {
  return { min: Math.ceil(guestCount / maxGuestsPerUnit), max: guestCount };
}
export function createSelection(activity: Experience): BookingActivitySelection {
  return { activityId: activity.id, guestCount: 1,
    ...(activity.booking?.model === "capacity_unit" ? { unitCount: 1 } : {}),
    ...(activity.durationOptions?.length === 1 ? { durationMinutes: activity.durationOptions[0]!.durationMinutes } : {}) };
}
/** Keep a chosen unit count when possible; clamp only when guests make it invalid. */
export function withGuestCount(selection: BookingActivitySelection, guestCount: number, activity: Experience) {
  if (activity.booking?.model !== "capacity_unit") return { ...selection, guestCount };
  const bounds = unitBounds(guestCount, activity.booking.maxGuestsPerUnit);
  return { ...selection, guestCount, unitCount: Math.min(bounds.max, Math.max(bounds.min, selection.unitCount ?? bounds.min)) };
}

export function createBookingRequestSchema(catalog: Experience[] = experiences, now = () => new Date(), packageCatalog: Package[] = packages) {
  const selectionSchema = (allowPendingDuration = false) => z.array(z.object({
      activityId: z.string().min(1, "invalidExperience").max(100, "invalidExperience"),
      guestCount: z.number().int("invalidGuestCount").min(1, "invalidGuestCount").max(MAX_REQUEST_GUESTS, "requestTooLarge"),
      durationMinutes: z.number().int("invalidDuration").positive("invalidDuration").optional(),
      unitCount: z.number().int("invalidUnitCount").positive("invalidUnitCount").max(MAX_REQUEST_GUESTS, "invalidUnitCount").optional(),
    })).max(50, "requestTooLarge").superRefine((selections, ctx) => {
      const seen = new Set<string>();
      selections.forEach((selection, index) => {
        const add = (field: string, message: string) => ctx.addIssue({code: "custom", path: [index, field], message});
        const activity = catalog.find(e => e.id === selection.activityId && e.booking);
        if (!activity) { add("activityId", "invalidExperience"); return; }
        if (seen.has(activity.id)) add("activityId", "duplicateActivity");
        seen.add(activity.id);
        const tiers = activity.durationOptions ?? [];
        if (((!allowPendingDuration && tiers.length) || selection.durationMinutes !== undefined) && !tiers.some(t =>
          Number.isInteger(t.durationMinutes) && t.durationMinutes > 0 && t.durationMinutes === selection.durationMinutes)) add("durationMinutes", "invalidDuration");
        if (activity.booking!.model === "capacity_unit") {
          const capacity = activity.booking!;
          if (!Number.isInteger(capacity.maxGuestsPerUnit) || capacity.maxGuestsPerUnit < 1) { add("unitCount", "invalidUnitCount"); return; }
          const {min, max} = unitBounds(selection.guestCount, capacity.maxGuestsPerUnit);
          if (selection.unitCount === undefined || selection.unitCount < min || selection.unitCount > max) add("unitCount", "invalidUnitCount");
        } else if (selection.unitCount !== undefined) add("unitCount", "unexpectedUnitCount");
      });
    });
  return z.object({
    schemaVersion: z.literal(3),
    visitDate: z.string().refine(date => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const value = Date.parse(date), clock = now();
      return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date &&
        date >= thailandToday(clock) && date <= maxBookingDate(clock) &&
        !siteConfig.blackoutDates?.includes(date) && !siteConfig.closedWeekdays?.includes(new Date(value).getUTCDay());
    }, "invalidDate"),
    // A preference, not an activity slot: no interval, closing-duration or sequencing rules.
    preferredStartTime: z.string().refine(isValidTimeFormat, "invalidTimeFormat"),
    customer: z.object({
      fullName: z.string().trim().min(1, "nameRequired").max(120, "nameRequired"),
      email: z.string().trim().email("invalidEmail").max(254, "invalidEmail"),
      phone: z.string().trim().min(6, "invalidPhone").max(30, "invalidPhone")
        .refine(value => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 6, "invalidPhone"),
    }),
    activities: selectionSchema(),
    packages: z.array(z.object({packageId:z.string().min(1).max(100),components:selectionSchema(true)})).max(3,"requestTooLarge").optional().superRefine((selections,ctx)=>{
      const seen = new Set<string>();
      for (const [index,selection] of (selections ?? []).entries()) {
        const pack = packageCatalog.find(p=>p.id===selection.packageId);
        const add = (field:string,message:string) => ctx.addIssue({code:"custom",path:[index,field],message});
        if (!pack?.components || seen.has(selection.packageId)) {add("packageId","invalidSubmission");continue;}
        seen.add(pack.id);
        if(selection.components.length!==pack.components.length) {add("components","invalidSubmission");continue;}
        for(const [i,component] of pack.components.entries()) {
          const chosen=selection.components[i];
          if(!chosen || chosen.activityId!==component.activityId || chosen.guestCount!==component.guestCount || chosen.unitCount!==component.unitCount || component.durationMinutes!==undefined && chosen.durationMinutes!==component.durationMinutes) add("components","invalidSubmission");
        }
      }
    }),
    notes: z.string().trim().max(500, "notesTooLong").optional(),
    locale: z.enum(["en", "ru", "th", "zh"]),
    company: z.string().max(0, "invalidSubmission").optional(),
  }).superRefine((draft,ctx)=>{if(!draft.activities.length&&!draft.packages?.length)ctx.addIssue({code:"custom",path:["activities"],message:"chooseExperience"});});
}
export const bookingRequestSchema = createBookingRequestSchema();

/** Component defaults are canonical; no duration inferred from a price tier/slot. */
export function createPackageSelection(pack: Package): BookingPackageSelection {
  return {packageId:pack.id,components:structuredClone(pack.components ?? [])};
}

/** Exact occupancy billing: paired = guests - vehicles, solo = 2*vehicles - guests. */
export function calculateSelectionEstimate(selection: BookingActivitySelection, catalog: Experience[] = experiences) {
  const pending = {itemId:selection.activityId,amount:null as number|null,amountMinor:null as number|null,...(selection.durationMinutes===undefined?{}:{durationMinutes:selection.durationMinutes})};
  const activity=catalog.find(e=>e.id===selection.activityId && e.booking);
  const tier=activity?.durationOptions?.find(t=>t.durationMinutes===selection.durationMinutes);
  if(!tier || tier.quantityBasis==="pending" || !Number.isSafeInteger(selection.guestCount) || selection.guestCount<1 || selection.guestCount>MAX_REQUEST_GUESTS) return pending;
  if(activity?.booking?.model==="capacity_unit") {
    const bounds=unitBounds(selection.guestCount,activity.booking.maxGuestsPerUnit);
    if(!Number.isInteger(selection.unitCount) || selection.unitCount!<bounds.min || selection.unitCount!>bounds.max)return pending;
  }
  let unitMinor:number,sharedMinor:number|undefined;
  try {if(tier.price.currency!=="THB")return pending;unitMinor=moneyToMinor(tier.price.amount);if(tier.quantityBasis==="occupancy") {if(activity?.booking?.model!=="capacity_unit" || activity.booking.maxGuestsPerUnit!==2 || tier.sharedPrice?.currency!=="THB")return pending;sharedMinor=moneyToMinor(tier.sharedPrice.amount);}}catch{return pending;}
  const quantity=tier.quantityBasis==="participant"?selection.guestCount:tier.quantityBasis==="booking"?1:selection.unitCount;
  if(!Number.isSafeInteger(quantity) || quantity!<1)return pending;
  const shared=selection.guestCount-quantity!,solo=2*quantity!-selection.guestCount;
  const minor=sharedMinor===undefined?BigInt(unitMinor)*BigInt(quantity!):BigInt(sharedMinor)*BigInt(shared)+BigInt(unitMinor)*BigInt(solo);
  if(minor>BigInt(Number.MAX_SAFE_INTEGER))throw new Error("Estimate exceeds safe money range");
  return {...pending,amount:Number(minor)/100,amountMinor:Number(minor),quantity,unit:tier.price.unit,...(sharedMinor===undefined?{unitAmount:tier.price.amount}:{occupancy:{shared,solo,soloAmount:tier.price.amount,sharedAmount:tier.sharedPrice!.amount}})};
}

/** Backend calls this immediately before storing the estimate and outbox. */
export function calculateRequestEstimate(draft: Pick<BookingRequestDraft,"activities"> & Partial<Pick<BookingRequestDraft,"visitDate"|"packages">>,catalog:Experience[]=experiences,now:Date=new Date(),config:PromotionConfig=promotionConfig,packageCatalog:Package[]=packages):BookingEstimate {
  const items=draft.activities.map(a=>calculateSelectionEstimate(a,catalog));
  const packageLines:PackageEstimateLine[]=(draft.packages??[]).map(selection=>{
    const pack=packageCatalog.find(p=>p.id===selection.packageId);
    // Always expand canonical components; submitted component prices/counts never price a package.
    const components=(pack?.components??[]).map(c=>{
      const chosen=selection.components.find(s=>s.activityId===c.activityId);
      const facts={...c,...(c.durationMinutes===undefined && chosen?.durationMinutes!==undefined?{durationMinutes:chosen.durationMinutes}:{})};
      return {...facts,amount:calculateSelectionEstimate(facts,catalog).amount};
    });
    let amountMinor:number|null=null;
    if(pack?.pricingMode==="sum_components" && components.length && components.every(c=>c.amount!==null))amountMinor=components.reduce((sum,c)=>sum+moneyToMinor(c.amount!),0);
    else if(pack && pack.pricingMode!=="sum_components" && !pack.mock.isMock && pack.estimateBasis==="package" && pack.price.currency==="THB")amountMinor=moneyToMinor(pack.price.amount);
    return {itemId:`package:${selection.packageId}`,packageId:selection.packageId,translationNamespace:pack?.translationNamespace??"",pricingMode:pack?.pricingMode??"fixed",components,amountMinor,amount:amountMinor===null?null:amountMinor/100};
  });
  const packageOffers:PromotionConfig["promotions"][number][]=[];
  for(const line of packageLines) {
    const pack=packageCatalog.find(p=>p.id===line.packageId),percent=pack?.discountPercent;
    if(percent==null || percent===0)continue;
    if(!Number.isFinite(percent) || percent<0 || percent>100)throw new Error("Invalid package discount percentage");
    packageOffers.push({id:`package-discount:${pack!.id}`,enabled:true,labels:{en:"Package discount",ru:"Скидка на пакет",th:"ส่วนลดแพ็กเกจ",zh:"套餐折扣"},scope:"package",targets:{packageIds:[pack!.id]},benefit:{type:"percentage",basisPoints:moneyToMinor(percent)},stacking:pack!.discountStacking??"EXCLUSIVE",...(pack!.discountStackingGroup?{stackingGroup:pack!.discountStackingGroup}:{}),priority:0});
  }
  const lines=[...items.filter(i=>catalog.some(e=>e.id===i.itemId&&e.booking)).map(i=>({id:i.itemId,type:"activity" as const,activityId:i.itemId,amountMinor:i.amountMinor})),...packageLines.filter(i=>packageCatalog.some(p=>p.id===i.packageId)).map(i=>({id:i.itemId,type:"package" as const,packageId:i.packageId,componentActivityIds:i.components.map(c=>c.activityId),amountMinor:i.amountMinor??null}))];
  // Reserved IDs protect the package/general discount distinction in immutable snapshots.
  if(config.promotions.some(p=>p.id.startsWith("package-discount:")))throw new Error("Reserved promotion ID");
  const promotions=calculatePromotions(lines,draft.visitDate,now,{...config,promotions:[...config.promotions,...packageOffers]});
  if(items.some(i=>!catalog.some(e=>e.id===i.itemId&&e.booking)) || packageLines.some(i=>!packageCatalog.some(p=>p.id===i.packageId))) {promotions.pricingStatus="PENDING";promotions.subtotalAmount=null;promotions.discountAmount=null;promotions.amount=null;promotions.subtotalMinor=null;promotions.discountMinor=null;promotions.amountMinor=null;}
  const packageDiscounts=promotions.appliedPromotions.filter(p=>p.id.startsWith("package-discount:"));
  promotions.appliedPromotions=promotions.appliedPromotions.filter(p=>!p.id.startsWith("package-discount:"));
  return {version:2,currency:"THB",items,amount:promotions.amount,promotions,...(packageLines.length?{packages:packageLines,packageDiscounts}:{})};
}
