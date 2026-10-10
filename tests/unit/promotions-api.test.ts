import {it,expect,vi,afterEach} from 'vitest';
import {createBookingHandler} from '@/lib/booking/api';
import {InMemoryBookingRepository} from '@/lib/booking/repository';
import {experiences} from '@/data/odin/experiences';
import {promotionConfig} from '@/data/odin/promotions';
import {offer} from '../fixtures/promotions';
const tier=[{durationMinutes:60,price:{amount:100,currency:'THB' as const,unit:'person' as const},quantityBasis:'participant' as const}];
afterEach(()=>vi.restoreAllMocks());
it('server ignores forged discount, total, applied IDs and submission date, recalculating canonical config',async()=>{
 vi.spyOn(experiences[0]!,'durationOptions','get').mockReturnValue(tier);
 const p=offer('test-server-offer',{benefit:{type:'percentage',basisPoints:1000}});
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([p]);
 const repository=new InMemoryBookingRepository();
 const handler=createBookingHandler(()=>({repository,processSecret:'',afterCreate:async()=>{},process:async()=>({processed:0})}));
 const body={schemaVersion:3,visitDate:new Date(Date.now()+5*86400000).toISOString().slice(0,10),preferredStartTime:'10:00',customer:{fullName:'Test',email:'test@example.com',phone:'+66000000000'},activities:[{activityId:'horse-riding',guestCount:2,durationMinutes:60,discount:999,price:1,promotionIds:['forged']}],locale:'en',submissionDate:'1900-01-01',discount:999,amount:1,promotionIds:['forged'],estimate:{amount:1,promotions:{appliedPromotions:[{id:'forged'}]}}};
 const key=crypto.randomUUID(),req=()=>new Request('http://localhost/api/booking',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(body)});
 const response=await handler(req());expect(response.status).toBe(201);const saved=await repository.getById((await response.json()).id);
 expect(saved?.estimate).toMatchObject({amount:180,promotions:{subtotalAmount:200,discountAmount:20,appliedPromotions:[{id:p.id}]}});
 expect(saved).not.toHaveProperty('discount');expect(saved).not.toHaveProperty('promotionIds');
 p.labels.en='Changed';p.benefit={type:'percentage',basisPoints:9000};
 const replay=await handler(req());expect(replay.status).toBe(201);expect(await repository.getById((await replay.json()).id)).toEqual(saved);
});
it('submission day is taken from server time, separately from the visit day',async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-10T17:00:00Z'));
 try {
 vi.spyOn(experiences[0]!,'durationOptions','get').mockReturnValue(tier);
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([offer('test-today',{conditions:{bookingDate:{from:'2026-10-11',through:'2026-10-11'}}})]);
 const repo=new InMemoryBookingRepository();
 const saved=await repo.create({schemaVersion:3,visitDate:'2026-10-20',preferredStartTime:'10:00',customer:{fullName:'Test',email:'test@example.com',phone:'+66000000000'},activities:[{activityId:'horse-riding',guestCount:1,durationMinutes:60}],locale:'en'});
 expect(saved.createdAt).toBe('2026-10-10T17:00:00.000Z');expect(saved.estimate.promotions?.submissionDate).toBe('2026-10-11');expect(saved.estimate.amount).toBe(95);
 } finally {vi.useRealTimers();}
});
