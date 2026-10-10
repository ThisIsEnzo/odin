import {it,expect,vi,afterEach} from 'vitest';
import {experiences} from '@/data/odin/experiences';
import {promotionConfig} from '@/data/odin/promotions';
import {InMemoryBookingRepository} from '@/lib/booking/repository';
import {buildBookingNotificationPayload} from '@/lib/booking/notify';
import {planDeliveries} from '@/lib/booking/outbox/plan';
import type {BookingRequestDraft} from '@/types/domain';
import {twoActivities,threeActivities,offer} from '../fixtures/promotions';
const draft=():BookingRequestDraft=>({schemaVersion:3,visitDate:'2026-10-20',preferredStartTime:'10:00',activities:[{activityId:'horse-riding',guestCount:2},{activityId:'atv',guestCount:5,unitCount:3},{activityId:'sauna',guestCount:2}],customer:{fullName:'TEST ONLY',email:'test@example.com',phone:'+66000000000'},locale:'ru'});
afterEach(()=>vi.restoreAllMocks());
it('known server prices produce explicit applied benefit, subtotal, discount and unconfirmed total',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([twoActivities,threeActivities]);
 for(const e of experiences)vi.spyOn(e,'durationOptions','get').mockReturnValue([{durationMinutes:90,quantityBasis:'booking',price:{amount:2000,currency:'THB',unit:'group'}}]);
 const d=draft();d.activities=d.activities.map(a=>({...a,durationMinutes:90}));
 const saved=await new InMemoryBookingRepository().create(d);
 expect(saved.estimate.promotions).toMatchObject({pricingStatus:'KNOWN',calculatedAt:saved.createdAt,appliedPromotions:[{id:'test-three',status:'APPLIED',discountAmount:600}]});
 const payload=buildBookingNotificationPayload(saved);
 expect(payload.text).toContain('Subtotal: 6000 THB');expect(payload.text).toContain('APPLIED PROMOTION: Test offer · 10%');expect(payload.text).toContain('Discount: −600 THB');expect(payload.text).toContain('Estimated total: 5400 THB');expect(payload.text).toContain('Final price and availability require manager confirmation');expect(payload.text).toContain('not a confirmed customer charge');expect(payload.text).not.toContain('test-two');
});
it('unknown server prices send engine-selected matched benefit and instruction without fabricated amounts',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([twoActivities,threeActivities]);
 const saved=await new InMemoryBookingRepository().create(draft());
 expect(saved.estimate.promotions).toMatchObject({pricingStatus:'PENDING',calculatedAt:saved.createdAt,subtotalMinor:null,discountMinor:null,amountMinor:null,appliedPromotions:[{id:'test-three',status:'ELIGIBLE',discountMinor:null}]});
 const text=buildBookingNotificationPayload(saved).text;
 expect(text).toContain('PRICING: Manager to confirm');expect(text).toContain('PROMOTION MATCHED (ELIGIBLE): Test offer · 10%');expect(text).toContain('Apply the eligible 10% offer');expect(text).toContain('Estimated total: manager to confirm');expect(text).not.toMatch(/Subtotal: \d|Discount: −\d|Estimated total: \d/);expect(text).not.toContain('test-two');
});
it('pending fixed offers describe the configured benefit without claiming a calculated amount',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([offer('fixed',{benefit:{type:'fixed_amount',amountMinor:15000,currency:'THB'}})]);
 const saved=await new InMemoryBookingRepository().create(draft()),text=buildBookingNotificationPayload(saved).text;
 expect(text).toContain('PROMOTION MATCHED (ELIGIBLE): Test offer · 150 THB fixed discount');expect(text).toContain('Apply the eligible 150 THB fixed discount offer');expect(text).not.toContain('Discount: −');expect(saved.estimate.promotions?.appliedPromotions[0]?.discountAmount).toBeNull();
});
it('notification preparation and LINE/WhatsApp envelopes only use frozen results after config changes',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([threeActivities]);
 const saved=await new InMemoryBookingRepository().create(draft());
 const first=buildBookingNotificationPayload(saved);
 vi.spyOn(promotionConfig,'promotions','get').mockImplementation(()=>{throw new Error('No promotion recalculation allowed');});
 const replay=buildBookingNotificationPayload(saved);expect(replay).toEqual(first);
 const plans=planDeliveries(replay,[{provider:'line',target:'test-line'},{provider:'whatsapp',target:'test-phone',phoneNumberId:'test-id',apiVersion:'v1',templateName:'test-template',templateLanguage:'en'}]);
 for(const provider of ['line','whatsapp']){const text=JSON.stringify(plans.filter(p=>p.provider===provider));expect(text).toContain('10%');expect(text).toContain('PROMOTION MATCHED');expect(text).toContain('test-three');}
});
it('historical promotion snapshots lacking new status/timestamp remain renderable without rewriting them',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([threeActivities]);
 const saved=await new InMemoryBookingRepository().create(draft());
 const historical=JSON.parse(JSON.stringify(saved));delete historical.estimate.promotions.calculatedAt;delete historical.estimate.promotions.pricingStatus;delete historical.estimate.promotions.appliedPromotions[0].status;
 const before=JSON.stringify(historical);expect(buildBookingNotificationPayload(historical).text).toContain('PROMOTION MATCHED (ELIGIBLE)');expect(JSON.stringify(historical)).toBe(before);
});
it('known scoped discount on a pending whole request is retained, without a fabricated whole total or double application',async()=>{
 vi.spyOn(promotionConfig,'promotions','get').mockReturnValue([offer('known-line',{scope:'activity',targets:{activityIds:['horse-riding']},benefit:{type:'percentage',basisPoints:1000}})]);
 vi.spyOn(experiences[0]!,'durationOptions','get').mockReturnValue([{durationMinutes:90,quantityBasis:'participant',price:{amount:100,currency:'THB',unit:'person'}}]);
 const d=draft();d.activities[0]!.durationMinutes=90;
 const saved=await new InMemoryBookingRepository().create(d),text=buildBookingNotificationPayload(saved).text;
 expect(saved.estimate.promotions).toMatchObject({pricingStatus:'PENDING',amount:null,appliedPromotions:[{status:'APPLIED',discountAmount:20}]});
 expect(text).toContain('APPLIED PROMOTION: Test offer · 10%');expect(text).toContain('Retain this already-applied scoped offer');expect(text).toContain('do not apply twice');expect(text).not.toContain('Apply the eligible');expect(text).not.toMatch(/Subtotal: \d|Discount: −\d|Estimated total: \d/);
});
