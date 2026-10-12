import type {BookingRequest as HistoricalBookingRequest} from "@/types/domain";
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {beforeAll,beforeEach,afterAll,describe,it,expect,vi} from 'vitest';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {eq,sql} from 'drizzle-orm';
import {openDatabase} from '@/lib/db/client';
import * as s from '@/lib/db/schema';
import {PostgresBookingRepository} from '@/lib/booking/postgres-repository';
import {OutboxProcessor,RETRY_POLICY} from '@/lib/booking/outbox/processor';
import {ProviderError} from '@/lib/booking/providers/http';
import {createActivity,createPackage} from '@/lib/booking/itinerary';
import {createBookingHandler} from '@/lib/booking/api';
import type {BookingDraft,BookingRequestDraft} from '@/types/domain';
import type {NotificationTarget} from '@/lib/booking/outbox/plan';
const url=process.env.TEST_DATABASE_URL;
// Fail closed; integration tests must never silently pass/skip without a dedicated DB.
if(!url)throw new Error('TEST_DATABASE_URL required (dedicated *_test database)');
const parsed=new URL(url);
const primary=process.env.DATABASE_URL?new URL(process.env.DATABASE_URL):null;
if(!parsed.pathname.endsWith('_test')||process.env.TEST_DATABASE_RESET!=='1'||primary&&primary.host===parsed.host&&primary.pathname===parsed.pathname)throw new Error('Refusing destructive tests: require dedicated *_test database, TEST_DATABASE_RESET=1, distinct from DATABASE_URL');
const {db,pool}=openDatabase(url);
const targets:NotificationTarget[]=[{provider:'console',target:'local'}];
const repo=new PostgresBookingRepository(db,targets);
const date=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
function draft():BookingDraft{const a=createActivity('horse-riding',date);a.time='10:00';a.participants=[{id:crypto.randomUUID(),weightKg:70},{id:crypto.randomUUID(),weightKg:80}];return {schemaVersion:2,locale:'en',customer:{name:'TEST ONLY',email:'qa@example.com',phone:'+66000000000'},items:[a],notes:'integration fixture'};}
const save=(d=draft(),key=crypto.randomUUID())=>repo.create(d,{idempotencyKey:key});
const due=()=>db.update(s.notificationDeliveries).set({nextAttemptAt:new Date(0)});
beforeAll(async()=>{await migrate(db,{migrationsFolder:'drizzle'});await migrate(db,{migrationsFolder:'drizzle'});});
beforeEach(async()=>{await db.execute(sql`truncate bookings cascade`);});
afterAll(async()=>{await pool.end();});
describe('real PostgreSQL repository',()=>{
 it('persists single activity and individual participant weights; reads exact aggregate',async()=>{const d=draft(),b=await save(d);expect(await repo.getById(b.id)).toEqual(b);expect(b.items).toEqual(d.items);expect(await db.select().from(s.bookingParticipants)).toHaveLength(2);expect(b.status).toBe('received');});
 it('persists multi-activity independent dates/times/counts',async()=>{const d=draft();const a=createActivity('atv',new Date(Date.now()+8*86400000).toISOString().slice(0,10));a.time='14:30';d.items.push(a);const b=await save(d);expect(((await repo.getById(b.id)) as HistoricalBookingRequest | null)?.items).toEqual(d.items);});
 it('persists package components plus extra and exact ordering',async()=>{const d=draft();const p=createPackage('couple-escape',date);p.components.forEach(a=>{a.time='10:00';if(a.experienceId==='horse-riding')a.participants[0]!.weightKg=70;});d.items.unshift(p);const b=await save(d);expect(((await repo.getById(b.id)) as HistoricalBookingRequest | null)?.items).toEqual(d.items);expect(await db.select().from(s.bookingItems)).toHaveLength(4);});
 it('supports future option persistence without adding catalog data',async()=>{const d=draft();d.items[0]!.options=[{optionId:'TEST_ONLY_ADAPTER_FIXTURE',quantity:2}];const b=await save(d);expect(((await repo.getById(b.id)) as HistoricalBookingRequest | null)?.items).toEqual(d.items);});
 it('rolls back booking and children on a child constraint failure',async()=>{const d=draft();d.items.push(structuredClone(d.items[0]!));await expect(save(d)).rejects.toThrow();expect(await db.select().from(s.bookings)).toHaveLength(0);expect(await db.select().from(s.bookingItems)).toHaveLength(0);expect(await db.select().from(s.notificationOutbox)).toHaveLength(0);});
 it('rolls back booking if outbox delivery planning/insertion fails',async()=>{const broken=new PostgresBookingRepository(db,[targets[0]!,targets[0]!]);await expect(broken.create(draft(),{idempotencyKey:crypto.randomUUID()})).rejects.toThrow();expect(await db.select().from(s.bookings)).toHaveLength(0);expect(await db.select().from(s.notificationOutbox)).toHaveLength(0);});
 it('concurrent same key returns one booking and one outbox',async()=>{const d=draft(),key=crypto.randomUUID();const all=await Promise.all(Array.from({length:4},()=>save(d,key)));expect(new Set(all.map(b=>b.id)).size).toBe(1);expect(await db.select().from(s.bookings)).toHaveLength(1);expect(await db.select().from(s.notificationOutbox)).toHaveLength(1);});
 it('conflicting reuse is rejected',async()=>{const key=crypto.randomUUID(),d=draft();await save(d,key);await expect(save({...d,notes:'different'},key)).rejects.toThrow('idempotency_conflict');});
 it('has unique public references separate from UUIDs',async()=>{const a=await save(),b=await save();expect(a.reference).toMatch(/^ODIN-[A-F0-9]{32}$/);expect(a.reference).not.toBe(b.reference);await expect(db.update(s.bookings).set({reference:a.reference!}).where(eq(s.bookings.id,b.id))).rejects.toThrow();});
 it('new connection/repository reads durable booking and outbox',async()=>{const b=await save();const fresh=openDatabase(url!);try{expect(await new PostgresBookingRepository(fresh.db,targets).getById(b.id)).toEqual(b);expect(await fresh.db.select().from(s.notificationOutbox)).toHaveLength(1);}finally{await fresh.pool.end();}});
 it('a fresh Node process reconstructs the persisted booking',async()=>{const b=await save();const stored=await repo.getById(b.id);const result=await promisify(execFile)(process.execPath,['--import','tsx','scripts/read-test-booking.ts',b.id],{env:process.env});expect(result.stdout.trim()).toBe(createHash('sha256').update(JSON.stringify(stored)).digest('hex'));});
 it('canonical outbox snapshot includes complete request',async()=>{const b=await save();const [event]=await db.select().from(s.notificationOutbox);expect(event?.payload.booking).toEqual(b);expect(event?.payload.reference).toBe(b.reference);});
});
describe('durable outbox',()=>{
 it('success records provider ID and no duplicate sends on repeated invocation',async()=>{await save();const send=vi.fn(async()=>({providerMessageId:'test-id'}));const p=new OutboxProcessor(db,send);await p.process();await p.process();expect(send).toHaveBeenCalledTimes(1);expect((await db.select().from(s.notificationDeliveries))[0]).toMatchObject({status:'sent',attempts:1,providerMessageId:'test-id'});expect((await db.select().from(s.notificationOutbox))[0]?.status).toBe('sent');});
 it('transient failure keeps booking, persists retry and succeeds later',async()=>{const b=await save();const p=new OutboxProcessor(db,async()=>{throw new ProviderError('provider_http_503',true);});await p.process();expect(await repo.getById(b.id)).not.toBeNull();const [delivery]=await db.select().from(s.notificationDeliveries);expect(delivery).toMatchObject({status:'pending',attempts:1,lastError:'provider_http_503'});expect(delivery!.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());await due();await new OutboxProcessor(db,async()=>({})).process();expect((await db.select().from(s.notificationDeliveries))[0]?.status).toBe('sent');});
 it('permanent error is dead without retries',async()=>{await save();await new OutboxProcessor(db,async()=>{throw new ProviderError('provider_http_400',false);}).process();expect((await db.select().from(s.notificationDeliveries))[0]?.status).toBe('dead');});
 it('max attempts is bounded',async()=>{await save();const p=new OutboxProcessor(db,async()=>{throw new ProviderError('network',true);});for(let i=0;i<RETRY_POLICY.maxAttempts;i++){await due();await p.process();}expect((await db.select().from(s.notificationDeliveries))[0]).toMatchObject({status:'dead',attempts:RETRY_POLICY.maxAttempts});});
 it('channel partial success does not resend the successful channel',async()=>{await new PostgresBookingRepository(db,[...targets,{provider:'line',target:'TEST'}]).create(draft(),{idempotencyKey:crypto.randomUUID()});const send=vi.fn(async(plan)=>{if(plan.provider==='line')throw new ProviderError('provider_http_401',false);return {};});await new OutboxProcessor(db,send).process();expect((await db.select().from(s.notificationOutbox))[0]?.status).toBe('partial');await new OutboxProcessor(db,send).process();expect(send).toHaveBeenCalledTimes(2);});
 it('two processors cannot deliver same part concurrently',async()=>{await save();let release!:()=>void;let entered!:()=>void;const enteredPromise=new Promise<void>(r=>{entered=r;});const barrier=new Promise<void>(r=>{release=r;});const send=vi.fn(async()=>{entered();await barrier;return {};});const first=new OutboxProcessor(db,send).process(1);await enteredPromise;const second=await new OutboxProcessor(db,send).process(1);expect(second.processed).toBe(0);release();await first;expect(send).toHaveBeenCalledTimes(1);});
 it('LINE retries retain identical envelope/key',async()=>{await new PostgresBookingRepository(db,[{provider:'line',target:'TEST'}]).create(draft(),{idempotencyKey:crypto.randomUUID()});const send=vi.fn(async()=>{throw new ProviderError('network',true);});const p=new OutboxProcessor(db,send);await p.process(1);await due();await p.process(1);expect(send.mock.calls[0]).toEqual(send.mock.calls[1]);});
 it('old LINE events stop before retry-key expiration',async()=>{await new PostgresBookingRepository(db,[{provider:'line',target:'TEST'}]).create(draft(),{idempotencyKey:crypto.randomUUID()});await db.update(s.notificationOutbox).set({createdAt:new Date(Date.now()-24*3600000)});const send=vi.fn(async()=>({}));await new OutboxProcessor(db,send).process();expect(send).not.toHaveBeenCalled();expect((await db.select().from(s.notificationDeliveries))[0]?.lastError).toBe('line_retry_window_expired');});
 it('API accepts persisted request even when immediate delivery fails',async()=>{const p=new OutboxProcessor(db,async()=>{throw new ProviderError('network',true);});const handler=createBookingHandler(()=>({repository:repo,processSecret:'',process:()=>p.process(),afterCreate:async id=>{await p.process(1,id);}}));const res=await handler(new Request('http://localhost/api/booking',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(requestDraft())}));expect(res.status).toBe(201);expect((await res.json()).status).toBe('received');expect(await db.select().from(s.bookings)).toHaveLength(1);expect((await db.select().from(s.notificationDeliveries))[0]?.status).toBe('pending');});
});

function requestDraft():BookingRequestDraft {return {schemaVersion:3,visitDate:date,preferredStartTime:'10:00',customer:{fullName:'TEST ONLY',email:'qa@example.com',phone:'+66000000000'},activities:[{activityId:'horse-riding',guestCount:2},{activityId:'atv',guestCount:5,unitCount:3}],locale:'en'};}
describe('real PostgreSQL V3 requests',()=>{
 it('round-trips counts and global timing without participant rows',async()=>{const d=requestDraft(),saved=await repo.create(d,{idempotencyKey:crypto.randomUUID()});expect(await repo.getById(saved.id)).toEqual(saved);expect(await db.select().from(s.bookingParticipants)).toHaveLength(0);expect(await db.select().from(s.bookingItems)).toHaveLength(0);expect(await db.select().from(s.bookingRequestActivities)).toHaveLength(2);});
 it('concurrent V3 requests with the same key create one aggregate and outbox',async()=>{const d=requestDraft(),key=crypto.randomUUID();const results=await Promise.all(Array.from({length:4},()=>repo.create(d,{idempotencyKey:key})));expect(new Set(results.map(b=>b.id)).size).toBe(1);expect(await db.select().from(s.bookings)).toHaveLength(1);expect(await db.select().from(s.bookingRequestActivities)).toHaveLength(2);expect(await db.select().from(s.notificationOutbox)).toHaveLength(1);});
 it('a new connection reconstructs V3 and keeps its frozen outbox snapshot',async()=>{const saved=await repo.create(requestDraft(),{idempotencyKey:crypto.randomUUID()}),fresh=openDatabase(url!);try{expect(await new PostgresBookingRepository(fresh.db,targets).getById(saved.id)).toEqual(saved);expect((await fresh.db.select().from(s.notificationOutbox))[0]?.payload.booking).toEqual(saved);}finally{await fresh.pool.end();}});
});
