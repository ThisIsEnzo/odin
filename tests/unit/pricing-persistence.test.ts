import {beforeAll,afterAll,it,expect,vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {migrate} from 'drizzle-orm/pglite/migrator';
import {eq} from 'drizzle-orm';
import {PostgresBookingRepository} from '@/lib/booking/postgres-repository';
import type {Database} from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import {experiences} from '@/data/odin/experiences';
import {catalog,draft} from '../fixtures/pricing';

// Real PostgreSQL SQL engine in-process; no production credentials or network providers.
const client=new PGlite();
const db=drizzle(client,{schema});
// Repository uses only the shared Drizzle select/insert/transaction surface.
const repo=new PostgresBookingRepository(db as unknown as Database,[{provider:'console',target:'test-only'}]);
beforeAll(async()=>{await migrate(db,{migrationsFolder:'drizzle'});},30000);
afterAll(async()=>{vi.restoreAllMocks();await client.close();});
it('migrates and round-trips duration plus immutable server price snapshot and outbox',async()=>{
 vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue(catalog[2]!.durationOptions);
 const d=draft(),key=crypto.randomUUID();const saved=await repo.create(d,{idempotencyKey:key});
 expect((await repo.getById(saved.id))).toEqual(saved);
 const rows=await db.select().from(schema.bookingItems).where(eq(schema.bookingItems.bookingId,saved.id));
 expect(rows[0]?.durationMinutes).toBe(60);expect(saved.estimate?.amount).toBe(200);
 const [event]=await db.select().from(schema.notificationOutbox).where(eq(schema.notificationOutbox.bookingId,saved.id));
 expect(event?.payload.booking.estimate).toEqual(saved.estimate);expect(event?.payload.text).toContain('Duration: 60 minutes');
 const newer=structuredClone(catalog[2]!.durationOptions!);newer[0]!.price.amount=999;
 vi.spyOn(experiences[2]!,'durationOptions','get').mockReturnValue(newer);
 expect((await repo.create(d,{idempotencyKey:key})).estimate?.amount).toBe(200);
 expect((await repo.getById(saved.id))?.estimate?.amount).toBe(200);
 expect((await repo.create(draft(),{idempotencyKey:crypto.randomUUID()})).estimate?.amount).toBe(1998);
 vi.restoreAllMocks();
});
it('preserves pending estimates and nullable duration without promoting mock prices',async()=>{
 const d=draft();if(d.items[0]?.type==='activity')delete d.items[0].durationMinutes;
 const saved=await repo.create(d,{idempotencyKey:crypto.randomUUID()});expect(saved.estimate?.amount).toBeNull();expect(await repo.getById(saved.id)).toEqual(saved);
});
it('rejects nonpositive stored durations at the database boundary',async()=>{
 const d=draft();if(d.items[0]?.type==='activity')d.items[0].durationMinutes=0;
 await expect(repo.create(d,{idempotencyKey:crypto.randomUUID()})).rejects.toThrow();
});
