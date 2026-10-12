import {describe,it,expect,vi,afterEach} from 'vitest';
import {experiences,bookableExperiences} from '@/data/odin/experiences';
import {createBookingRequestSchema,calculateRequestEstimate,unitBounds,withGuestCount,createSelection} from '@/lib/booking/request';
import {buildBookingNotificationPayload} from '@/lib/booking/notify';
import {InMemoryBookingRepository} from '@/lib/booking/repository';
import type {BookingRequestDraft,Experience} from '@/types/domain';
const now=()=>new Date('2026-10-10T18:00:00Z');
const schema=createBookingRequestSchema(experiences,now);
function draft():BookingRequestDraft{return {schemaVersion:3,visitDate:'2026-10-12',preferredStartTime:'10:00',customer:{fullName:'Guest',email:'qa@example.com',phone:'+66000000000'},activities:[{activityId:'horse-riding',guestCount:2,durationMinutes:60},{activityId:'pony-riding',guestCount:1,durationMinutes:60},{activityId:'atv',guestCount:5,unitCount:3,durationMinutes:30}],notes:'A relaxed visit',locale:'en'};}
afterEach(()=>vi.restoreAllMocks());
describe('V3 canonical request rules',()=>{
 it('does not need weights, participant rows, separate dates or activity times',()=>{expect(schema.parse(draft())).toEqual(draft());expect(experiences[0]!.restrictions.maxWeightKg).toBe(90);expect(experiences[1]!.restrictions.maxWeightKg).toBe(60);});
 it.each([1,2,3,4,5])('enforces every valid and invalid vehicle count for %i guests',guests=>{
  const bounds=unitBounds(guests,2);for(let units=0;units<=guests+1;units++){const d=draft();d.activities=[{activityId:'atv',guestCount:guests,unitCount:units,durationMinutes:30}];expect(schema.safeParse(d).success).toBe(units>=bounds.min&&units<=bounds.max);}
 });
 it.each([3,4,5])('allows 5 guests and %i ATVs',units=>{const d=draft();d.activities=[{activityId:'atv',guestCount:5,unitCount:units,durationMinutes:30}];expect(schema.safeParse(d).success).toBe(true);});
 it('preserves flexible unit counts and clamps only when guest changes require it',()=>{const atv=experiences[2]!;expect(withGuestCount({activityId:'atv',guestCount:5,unitCount:4},6,atv).unitCount).toBe(4);expect(withGuestCount({activityId:'atv',guestCount:5,unitCount:5},3,atv).unitCount).toBe(3);expect(withGuestCount({activityId:'atv',guestCount:1,unitCount:1},5,atv).unitCount).toBe(3);});
 it.each(['2026-02-30','2026-10-10','2027-12-01','not-a-date'])('rejects invalid or out-of-window visit date %s',visitDate=>expect(schema.safeParse({...draft(),visitDate}).success).toBe(false));
 it.each(['24:00','10:99','','9:00'])('rejects malformed preference %s',preferredStartTime=>expect(schema.safeParse({...draft(),preferredStartTime}).success).toBe(false));
 it('rejects unknown/non-bookable activities, duplicates, irrelevant units and invented durations',()=>{
  for(const activities of [[{activityId:'restaurant',guestCount:1}],[{activityId:'horse-riding',guestCount:1,unitCount:1}],[{activityId:'atv',guestCount:1}],[{activityId:'horse-riding',guestCount:1,durationMinutes:75}],[{activityId:'sauna',guestCount:1},{activityId:'sauna',guestCount:1}]])expect(schema.safeParse({...draft(),activities}).success).toBe(false);
 });
 it.each([0,-1,1.5,201,Infinity])('rejects invalid guest count %s',guestCount=>expect(schema.safeParse({...draft(),activities:[{activityId:'sauna',guestCount}]}).success).toBe(false));
 it('accepts approved duration independent of arrival, closing and other activity durations',()=>{
  const catalog=structuredClone(experiences);for(const activity of catalog)activity.durationOptions=[{durationMinutes:120,price:{amount:100,currency:'THB',unit:'person'},quantityBasis:'participant'}];
  const d=draft();d.preferredStartTime='17:45';d.activities=d.activities.map(a=>({...a,durationMinutes:120}));expect(createBookingRequestSchema(catalog,now).safeParse(d).success).toBe(true);
  delete d.activities[0]!.durationMinutes;expect(createBookingRequestSchema(catalog,now).safeParse(d).success).toBe(false);
 });
 it('a fifth bookable service uses the same schema and generic behavior',()=>{
  const future:Experience={...structuredClone(experiences[2]!),id:'kayak',slug:'kayak',booking:{model:'capacity_unit',maxGuestsPerUnit:3,unitTranslationKey:'booking.units.kayak'}};
  const catalog=[...experiences,future,{...future,id:'restaurant',booking:undefined}];expect(bookableExperiences(catalog)).toHaveLength(5);expect(createBookingRequestSchema(catalog,now).safeParse({...draft(),activities:[{activityId:'kayak',guestCount:5,unitCount:2,durationMinutes:30}]}).success).toBe(true);expect(createSelection(future).unitCount).toBe(1);
 });
 it.each([{fullName:''},{email:'invalid'},{phone:'abcdef'},{phone:'12345'}])('rejects invalid contact fields %j',fields=>{const d=draft();expect(schema.safeParse({...d,customer:{...d.customer,...fields}}).success).toBe(false);});
 it('strips untrusted prices and participant/weight data',()=>{const d=draft();const result=schema.parse({...d,estimate:{amount:1},activities:d.activities.map(a=>({...a,price:1,participants:[{weightKg:70}]}))});expect(result).not.toHaveProperty('estimate');expect(result.activities[0]).not.toHaveProperty('participants');});
});
describe('V3 estimates and staff messages',()=>{
 it('supports explicit per-person, per-unit and per-booking tiers, with no partial total',()=>{
  const catalog=structuredClone(experiences);catalog[0]!.durationOptions=[{durationMinutes:60,price:{amount:100,currency:'THB',unit:'person'},quantityBasis:'participant'}];catalog[2]!.durationOptions=[{durationMinutes:60,price:{amount:250,currency:'THB',unit:'vehicle'},quantityBasis:'unit'}];catalog[3]!.durationOptions=[{durationMinutes:60,price:{amount:500,currency:'THB',unit:'group'},quantityBasis:'booking'}];
  const d={activities:[{activityId:'horse-riding',guestCount:2,durationMinutes:60},{activityId:'atv',guestCount:5,unitCount:3,durationMinutes:60},{activityId:'sauna',guestCount:5,durationMinutes:60}]};const estimate=calculateRequestEstimate(d,catalog);expect(estimate.amount).toBe(1450);expect(estimate.items.map(i=>i.quantity)).toEqual([2,3,1]);
  expect(calculateRequestEstimate({activities:[...d.activities,{activityId:'pony-riding',guestCount:1}]},catalog).amount).toBeNull();
  catalog[2]!.durationOptions[0]!.quantityBasis='participant';expect(calculateRequestEstimate({activities:[d.activities[1]!]},catalog).amount).toBe(1250);
 });
 it('rounds money in minor units and never uses legacy mock prices',()=>{expect(calculateRequestEstimate(draft()).amount).toBe(5400);const catalog=structuredClone(experiences);catalog[0]!.durationOptions=[{durationMinutes:60,price:{amount:.1,currency:'THB',unit:'person'},quantityBasis:'participant'}];expect(calculateRequestEstimate({activities:[{activityId:'horse-riding',guestCount:3,durationMinutes:60}]},catalog).amount).toBe(.3);});
 it('staff receive global visit, counts, capacity, restrictions and pending total',async()=>{const saved=await new InMemoryBookingRepository().create(draft());const text=buildBookingNotificationPayload(saved).text;for(const value of ['Visit date: 2026-10-12','Preferred arrival time: 10:00','Customer: Guest','Horse Riding','Maximum rider weight: 90 kg','Maximum rider weight: 60 kg','Guests: 5','Units (ATVs): 3','Notes: A relaxed visit','Estimated total: 5400 THB'])expect(text).toContain(value);expect(text).not.toContain('Guest 1:');});
 it('memory replay returns the original V3 snapshot after prices change',async()=>{const tier=[{durationMinutes:60,price:{amount:250,currency:'THB' as const,unit:'vehicle' as const},quantityBasis:'unit' as const}];vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue(tier);const repo=new InMemoryBookingRepository(),d={...draft(),activities:[{activityId:'atv',guestCount:5,unitCount:3,durationMinutes:60}]},key=crypto.randomUUID();const saved=await repo.create(d,{idempotencyKey:key});expect(saved.estimate.amount).toBe(750);vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue([{...tier[0]!,price:{...tier[0]!.price,amount:999}}]);expect((await repo.create(d,{idempotencyKey:key})).estimate.amount).toBe(750);expect(await repo.getById(saved.id)).toEqual(saved);});
});
