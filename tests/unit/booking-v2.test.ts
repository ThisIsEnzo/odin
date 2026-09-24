import {describe,it,expect,vi} from "vitest";
import {bookingSchema} from "@/lib/validation/booking.schema";
import {createActivity,createPackage,duplicateItem,initializeVisit,removeItem,updateActivity,activitiesOf} from "@/lib/booking/itinerary";
import {validateVisit,thailandToday,availableContactChannels} from "@/lib/booking/rules";
import {experiences} from "@/data/odin/experiences";
import {packages} from "@/data/odin/packages";
import {siteConfig} from "@/data/odin/site";
import {InMemoryBookingRepository} from "@/lib/booking/repository";
import {submitBooking} from "@/lib/booking/submit";
import {buildBookingNotificationPayload,FanoutNotificationService} from "@/lib/booking/notify";
import {LineNotificationProvider} from "@/lib/booking/providers/line";
import {WhatsAppNotificationProvider} from "@/lib/booking/providers/whatsapp";
import type {ActivityBookingItem,BookingItem,BookingDraft,ExperienceId,BookingOption} from "@/types/domain";
const date=(days=5)=>new Date(Date.now()+days*86400000).toISOString().slice(0,10);
function activity(id:ExperienceId="atv",count=1):ActivityBookingItem {
 const a=createActivity(id,date());a.time="10:00";
 a.participants=Array.from({length:count},()=>({id:crypto.randomUUID(),...(experiences.find(e=>e.id===id)!.requiresWeight?{weightKg:55}:{})}));return a;
}
function draft(items:BookingItem[]=[activity()]):BookingDraft {return {schemaVersion:2,items,customer:{name:"Test Guest",email:"qa@example.com",phone:"+66000000000"},locale:"en"};}
function pack(){const p=createPackage("couple-escape",date());p.components=p.components.map(a=>activity(a.experienceId,2));return p;}
describe("Booking V2",()=>{
 it("accepts two activities with different counts dates and times",()=>{const a=activity("horse-riding",2),b=activity("atv",4);b.date=date(8);b.time="14:30";expect(bookingSchema.safeParse(draft([a,b])).success).toBe(true);});
 it("accepts three activities in one request",()=>expect(bookingSchema.safeParse(draft([activity("horse-riding",2),activity("atv",4),activity("sauna",3)])).success).toBe(true));
 it.each(["horse-riding","pony-riding"] as const)("validates every %s rider",id=>{const a=activity(id,2);const max=experiences.find(e=>e.id===id)!.restrictions.maxWeightKg!;a.participants[1]!.weightKg=max;expect(bookingSchema.safeParse(draft([a])).success).toBe(true);a.participants[1]!.weightKg=max+1;const r=bookingSchema.safeParse(draft([a]));expect(r.success).toBe(false);if(!r.success)expect(r.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({path:["items",0,"participants",1,"weightKg"],message:"weightExceedsMaximum"})]));});
 it.each(["horse-riding","pony-riding"] as const)("rejects missing second %s weight",id=>{const a=activity(id,2);delete a.participants[1]!.weightKg;expect(bookingSchema.safeParse(draft([a])).success).toBe(false);});
 it.each(["atv","sauna"] as const)("accepts %s without weights",id=>expect(bookingSchema.safeParse(draft([activity(id,3)])).success).toBe(true));
 it("rejects irrelevant weight",()=>{const a=activity();a.participants[0]!.weightKg=70;expect(bookingSchema.safeParse(draft([a])).success).toBe(false);});
 it("removes only selected item",()=>{const a=activity(),b=activity("sauna",3);expect(removeItem([a,b],a.id)).toEqual([b]);});
 it("edits independently",()=>{const a=activity(),b=activity("sauna",3);const next=updateActivity([a,b],{...a,time:"12:00"});expect(next[1]).toBe(b);expect(activitiesOf(next[0]!)[0]!.time).toBe("12:00");});
 it("duplicates with fresh IDs and independent participant data",()=>{const a=pack(),b=duplicateItem(a);expect(b.id).not.toBe(a.id);const ids=activitiesOf(a).flatMap(x=>[x.id,...x.participants.map(p=>p.id)]);for(const x of activitiesOf(b))expect(ids).not.toContain(x.id);activitiesOf(b)[0]!.participants[0]!.weightKg=1;expect(a.components[0]!.participants[0]!.weightKg).toBe(55);});
 it.each(["horse-riding","pony-riding","atv","sauna"])("preserves %s link",id=>expect(initializeVisit(id,null)[0]).toMatchObject({type:"activity",experienceId:id}));
 it.each(packages.map(p=>p.id))("initializes full %s",id=>{const p=initializeVisit(null,id)[0]!;expect(p.type).toBe("package");expect(activitiesOf(p).map(a=>a.experienceId)).toEqual(packages.find(p=>p.id===id)!.includedExperienceIds);});
 it("accepts package plus extra",()=>expect(bookingSchema.safeParse(draft([pack(),activity("pony-riding")])).success).toBe(true));
 it("rejects missing package component",()=>{const p=pack();p.components.pop();expect(bookingSchema.safeParse(draft([p])).success).toBe(false);});
 it("rejects unknown package",()=>{const p=pack();p.packageId="invented";expect(bookingSchema.safeParse(draft([p])).success).toBe(false);});
 it("rejects empty request",()=>expect(bookingSchema.safeParse(draft([])).success).toBe(false));
 it("rejects duplicate IDs",()=>{const a=activity();expect(bookingSchema.safeParse(draft([a,a])).success).toBe(false);});
 it("rejects invented options",()=>{const a=activity();a.options=[{optionId:"transfer",quantity:1}];expect(bookingSchema.safeParse(draft([a])).success).toBe(false);});
 it("validates option applicability and quantities against injected catalog",()=>{const a=activity();const o:BookingOption={id:"test-only",translationNamespace:"test",type:"other",applicableTo:{experienceIds:["atv"]},constraints:{minQuantity:1,maxQuantity:2}};a.options=[{optionId:o.id,quantity:2}];expect(validateVisit([a],experiences,packages,[o])).toEqual([]);a.options[0]!.quantity=3;expect(validateVisit([a],experiences,packages,[o])[0]?.key).toBe("invalidOption");});
 it("uses Thailand date",()=>expect(thailandToday(new Date("2026-10-01T18:00:00Z"))).toBe("2026-10-02"));
 it("hides mock channels",()=>expect(availableContactChannels(siteConfig)).toEqual([]));
 it("rejects forged contact preference",()=>{const d=draft();d.customer.preferredChannel="whatsapp";d.customer.channelIdentity="12345678";expect(bookingSchema.safeParse(d).success).toBe(false);});
 it("rejects V1 payload rather than guessing per-rider weights",()=>expect(bookingSchema.safeParse({experienceId:"horse-riding",guests:2,weightKg:70}).success).toBe(false));
});
describe("Persistence and notifications",()=>{
 it("persists received despite failed notification",async()=>{const repo=new InMemoryBookingRepository();const r=await submitBooking(draft([pack(),activity()]),repo,{notifyBookingReceived:async()=>{throw new Error("offline");}});expect(r.status).toBe("received");expect((await repo.getById(r.id))?.items).toHaveLength(2);});
 it("isolates channel failure",async()=>{const send=vi.fn(async()=>{});const service=new FanoutNotificationService([{name:"line",send:async()=>{throw new Error("offline");}},{name:"whatsapp",send}]);const b=await new InMemoryBookingRepository().create(draft());expect(await service.notifyBookingReceived(b)).toEqual([{channel:"line",status:"failed"},{channel:"whatsapp",status:"accepted"}]);expect(send).toHaveBeenCalledOnce();});
 it("does not notify before persistence",async()=>{const notify=vi.fn();await expect(submitBooking(draft(),{create:async()=>{throw new Error("db");},getById:async()=>null},{notifyBookingReceived:notify})).rejects.toThrow();expect(notify).not.toHaveBeenCalled();});
 it("repository isolates references",async()=>{const repo=new InMemoryBookingRepository();const d=draft();const b=await repo.create(d);d.items.length=0;b.items.length=0;expect((await repo.getById(b.id))?.items).toHaveLength(1);});
 it("payload includes whole itinerary, package, weights, notes",async()=>{const d=draft([pack(),activity("atv",4)]);d.notes="test note";const p=buildBookingNotificationPayload(await new InMemoryBookingRepository().create(d));for(const text of ["couple-escape","horse-riding","sauna","atv","Guest 2: 55 kg","Participants: 4","test note","RECEIVED","Restaurant"])expect(p.text).toContain(text);});
 it("LINE uses official endpoint with mocked transport",async()=>{const fetcher=vi.fn(async(_url:string|URL|Request,_init?:RequestInit)=>new Response("{}",{status:200}));const p=buildBookingNotificationPayload(await new InMemoryBookingRepository().create(draft()));await new LineNotificationProvider({token:"test",recipientId:"test-recipient"},fetcher).send(p);expect(fetcher.mock.calls[0]?.[0]).toBe("https://api.line.me/v2/bot/message/push");});
 it("WhatsApp uses configured template with mocked transport",async()=>{const calls:RequestInit[]=[];const fetcher:typeof fetch=async(_url,init)=>{calls.push(init!);return new Response("{}",{status:200});};const p=buildBookingNotificationPayload(await new InMemoryBookingRepository().create(draft([pack()])));await new WhatsAppNotificationProvider({token:"test",phoneNumberId:"123",recipient:"456",apiVersion:"v99.0",templateName:"test_template",templateLanguage:"en"},fetcher).send(p);const body=JSON.parse(calls[0]!.body as string);expect(body.type).toBe("template");expect(body.template.components[0].parameters[2].text).toContain("horse-riding");});
 it("missing config never sends",async()=>{const fetcher=vi.fn();const p=buildBookingNotificationPayload(await new InMemoryBookingRepository().create(draft()));await expect(new LineNotificationProvider({token:"",recipientId:""},fetcher).send(p)).rejects.toThrow();expect(fetcher).not.toHaveBeenCalled();});
});
