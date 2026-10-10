import {beforeAll,afterAll,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {PostgresBookingRepository} from '@/lib/booking/postgres-repository';
import {IdempotencyConflict} from '@/lib/booking/idempotency';
import {experiences} from '@/data/odin/experiences';
import type {Database} from '@/lib/db/client';
import type {BookingRequestDraft} from '@/types/domain';
import * as schema from '@/lib/db/schema';
const client=new PGlite(),db=drizzle(client,{schema});
const repo=new PostgresBookingRepository(db as unknown as Database,[{provider:'console',target:'test-only'}]);
const oldId=crypto.randomUUID(),oldItem=crypto.randomUUID();
function draft():BookingRequestDraft{return {schemaVersion:3,visitDate:'2026-10-12',preferredStartTime:'17:45',customer:{fullName:'TEST ONLY',email:'qa@example.com',phone:'+66000000000'},activities:[{activityId:'horse-riding',guestCount:2},{activityId:'atv',guestCount:5,unitCount:3}],notes:'Test fixture',locale:'en'};}
beforeAll(async()=>{
 for(const file of ['0000_massive_gabe_jones.sql','0001_superb_wiccan.sql'])await client.exec(readFileSync(`drizzle/${file}`,'utf8'));
 // A real pre-existing V2 row with weight and individual timing, before the additive V3 migration.
 await client.query("INSERT INTO bookings (id,reference,schema_version,locale,customer_name,email,phone,idempotency_key,request_hash) VALUES ($1,'HISTORICAL-TEST',2,'en','OLD TEST','old@example.com','+66000000000',$2,'old-hash')",[oldId,crypto.randomUUID()]);
 await client.query("INSERT INTO booking_items (id,booking_id,domain_id,position,type,experience_id,date,time,duration_minutes) VALUES ($1,$2,'old-activity',0,'activity','horse-riding','2026-09-01','10:00',60)",[oldItem,oldId]);
 await client.query("INSERT INTO booking_participants (id,item_id,domain_id,position,weight_kg) VALUES ($1,$2,'old-rider',0,75.5)",[crypto.randomUUID(),oldItem]);
 await client.exec(readFileSync('drizzle/0002_deep_wonder_man.sql','utf8'));
},30000);
afterAll(async()=>{vi.restoreAllMocks();await client.close();});
it('reads exact historical V2 shape and rider weight after additive migration',async()=>{const historical=await repo.getById(oldId);expect(historical?.schemaVersion).toBe(2);if(historical?.schemaVersion!==2)throw new Error('Expected V2');expect(historical.items[0]).toMatchObject({date:'2026-09-01',time:'10:00',durationMinutes:60,participants:[{id:'old-rider',weightKg:75.5}]});expect(historical).not.toHaveProperty('activities');});
it('persists global visit, V3 counts, no participants, estimate and identical transactional outbox',async()=>{const d=draft(),saved=await repo.create(d,{idempotencyKey:crypto.randomUUID()});expect(await repo.getById(saved.id)).toEqual(saved);const activities=await db.select().from(schema.bookingRequestActivities).where(eq(schema.bookingRequestActivities.bookingId,saved.id));expect(activities.map(a=>[a.guestCount,a.unitCount])).toEqual([[2,null],[5,3]]);expect(await db.select().from(schema.bookingItems).where(eq(schema.bookingItems.bookingId,saved.id))).toHaveLength(0);expect(await db.select().from(schema.bookingParticipants)).toHaveLength(1);const [event]=await db.select().from(schema.notificationOutbox).where(eq(schema.notificationOutbox.bookingId,saved.id));expect(event?.payload.booking).toEqual(saved);expect(event?.payload.text).toContain('Preferred arrival time: 17:45');expect(event?.payload.text).toContain('Units (ATVs): 3');expect(await db.select().from(schema.notificationDeliveries).where(eq(schema.notificationDeliveries.outboxId,event!.id))).toHaveLength(1);});
it('replays V3 idempotently with original per-unit price even after catalog changes',async()=>{const tiers=[{durationMinutes:60,price:{amount:250,currency:'THB' as const,unit:'vehicle' as const},quantityBasis:'unit' as const}];vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue(tiers);const d={...draft(),activities:[{activityId:'atv',guestCount:5,unitCount:3,durationMinutes:60}]},key=crypto.randomUUID();const saved=await repo.create(d,{idempotencyKey:key});expect(saved.estimate.amount).toBe(750);vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue([{...tiers[0]!,price:{...tiers[0]!.price,amount:999}}]);expect(await repo.create(d,{idempotencyKey:key})).toEqual(saved);expect(await repo.getById(saved.id)).toEqual(saved);await expect(repo.create({...d,preferredStartTime:'11:00'},{idempotencyKey:key})).rejects.toBeInstanceOf(IdempotencyConflict);vi.restoreAllMocks();});
it('rolls back the entire V3 request on a line constraint failure',async()=>{const d=draft();d.activities.push({...d.activities[0]!});const before=(await db.select().from(schema.bookings)).length;await expect(repo.create(d,{idempotencyKey:crypto.randomUUID()})).rejects.toThrow();expect(await db.select().from(schema.bookings)).toHaveLength(before);});
it('DB constraints require positive counts and V3 global visit fields',async()=>{const d=draft();d.activities[0]!.guestCount=0;await expect(repo.create(d,{idempotencyKey:crypto.randomUUID()})).rejects.toThrow();await expect(db.insert(schema.bookings).values({id:crypto.randomUUID(),reference:'INVALID-V3',schemaVersion:3,locale:'en',customerName:'TEST',email:'qa@example.com',phone:'+66000000000',idempotencyKey:crypto.randomUUID(),requestHash:'fixture'})).rejects.toThrow();});


it('persists promotion labels, exact amounts and outbox; same key replays before invalid config',async()=>{
 const {promotionConfig}=await import('@/data/odin/promotions');
 const {offer}=await import('../fixtures/promotions');
 const p=offer('test-frozen-discount',{scope:'activity',targets:{activityIds:['atv']},benefit:{type:'percentage',basisPoints:1000}});
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([p]);
 vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue([{durationMinutes:60,price:{amount:250,currency:'THB',unit:'vehicle'},quantityBasis:'unit'}]);
 const d={...draft(),activities:[{activityId:'atv',guestCount:5,unitCount:3,durationMinutes:60}]},key=crypto.randomUUID();
 const saved=await repo.create(d,{idempotencyKey:key});
 expect(saved.estimate).toMatchObject({version:2,amount:675,promotions:{subtotalMinor:75000,discountMinor:7500,amountMinor:67500,appliedPromotions:[{id:p.id,discountAmount:75,discountMinor:7500,labels:{en:'Test offer'}}]}});
 const [event]=await db.select().from(schema.notificationOutbox).where(eq(schema.notificationOutbox.bookingId,saved.id));
 expect(event?.payload.booking.estimate).toEqual(saved.estimate);expect(event?.payload.text).toContain('test-frozen-discount');
 // Invalid live config must not affect historical idempotency or reads.
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([{...p,benefit:{type:'percentage',basisPoints:10001}}]);
 expect(await repo.create(d,{idempotencyKey:key})).toEqual(saved);
 expect(await repo.getById(saved.id)).toEqual(saved);
 const before=(await db.select().from(schema.bookings)).length;
 await expect(repo.create(d,{idempotencyKey:crypto.randomUUID()})).rejects.toThrow();
 expect(await db.select().from(schema.bookings)).toHaveLength(before);
 vi.restoreAllMocks();
});
