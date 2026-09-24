import {randomUUID} from 'node:crypto';
import {eq,inArray,asc} from 'drizzle-orm';
import type {Database} from '../db/client';
import * as s from '../db/schema';
import type {ActivityBookingItem,BookingDraft,BookingItem,BookingRequest,ContactChannel,ExperienceId,Locale} from '@/types/domain';
import type {BookingRepository,CreateBookingOptions} from './repository';
import {bookingReference,fingerprint,IdempotencyConflict,validIdempotencyKey} from './idempotency';
import {buildBookingNotificationPayload} from './notify';
import {planDeliveries,type NotificationTarget} from './outbox/plan';
type Reader=Pick<Database,'select'>;
export class PostgresBookingRepository implements BookingRepository {
 constructor(private db:Database,private targets:NotificationTarget[]) {if(!targets.length)throw new Error('Notification targets required');}
 async create(draft:BookingDraft,options?:CreateBookingOptions):Promise<BookingRequest> {
  const key=options?.idempotencyKey;if(!key||!validIdempotencyKey(key))throw new Error('Idempotency key required');
  const hash=fingerprint(draft);
  return this.db.transaction(async tx=>{
   const id=randomUUID(),reference=bookingReference(),createdAt=new Date();
   const inserted=await tx.insert(s.bookings).values({id,reference,status:'received',schemaVersion:2,locale:draft.locale,customerName:draft.customer.name,email:draft.customer.email,phone:draft.customer.phone,preferredChannel:draft.customer.preferredChannel,channelIdentity:draft.customer.channelIdentity,notes:draft.notes,idempotencyKey:key,requestHash:hash,createdAt,updatedAt:createdAt}).onConflictDoNothing({target:s.bookings.idempotencyKey}).returning({id:s.bookings.id});
   if(!inserted.length){const [existing]=await tx.select().from(s.bookings).where(eq(s.bookings.idempotencyKey,key));if(!existing||existing.requestHash!==hash)throw new IdempotencyConflict();return (await this.read(tx,existing.id))!;}
   const insertItem=async(item:BookingItem,position:number,parentId?:string)=>{
    const rowId=randomUUID();
    await tx.insert(s.bookingItems).values({id:rowId,bookingId:id,domainId:item.id,parentId,position,type:item.type,...(item.type==='activity'?{experienceId:item.experienceId,date:item.date,time:item.time}:{packageId:item.packageId})});
    if(item.options.length)await tx.insert(s.bookingItemOptions).values(item.options.map((o,position)=>({id:randomUUID(),itemId:rowId,position,...o})));
    if(item.type==='activity'&&item.participants.length)await tx.insert(s.bookingParticipants).values(item.participants.map((p,position)=>({id:randomUUID(),itemId:rowId,domainId:p.id,position,weightKg:p.weightKg})));
    if(item.type==='package')for(const [i,c] of item.components.entries())await insertItem(c,i,rowId);
   };
   for(const [i,item] of draft.items.entries())await insertItem(item,i);
   const booking:BookingRequest={...structuredClone(draft),id,reference,status:'received',createdAt:createdAt.toISOString()};
   const payload=buildBookingNotificationPayload(booking),outboxId=randomUUID();
   await tx.insert(s.notificationOutbox).values({id:outboxId,bookingId:id,eventType:payload.event,payload});
   const plans=planDeliveries(payload,this.targets);
   await tx.insert(s.notificationDeliveries).values(plans.map(plan=>({id:randomUUID(),outboxId,provider:plan.provider,target:plan.target,part:plan.part,plan,retryKey:randomUUID()})));
   return booking;
  });
 }
 async getById(id:string){return this.read(this.db,id);}
 private async read(db:Reader,id:string):Promise<BookingRequest|null>{
  const [b]=await db.select().from(s.bookings).where(eq(s.bookings.id,id));if(!b)return null;
  const rows=await db.select().from(s.bookingItems).where(eq(s.bookingItems.bookingId,id)).orderBy(asc(s.bookingItems.position));
  const ids=rows.map(r=>r.id);
  const participants=ids.length?await db.select().from(s.bookingParticipants).where(inArray(s.bookingParticipants.itemId,ids)).orderBy(asc(s.bookingParticipants.position)):[];
  const options=ids.length?await db.select().from(s.bookingItemOptions).where(inArray(s.bookingItemOptions.itemId,ids)).orderBy(asc(s.bookingItemOptions.position)):[];
  const item=(r:typeof rows[number]):BookingItem=>{
   const common={id:r.domainId,options:options.filter(o=>o.itemId===r.id).map(o=>({optionId:o.optionId,quantity:o.quantity}))};
   if(r.type==='package')return {...common,type:'package',packageId:r.packageId!,components:rows.filter(c=>c.parentId===r.id).map(c=>item(c) as ActivityBookingItem)};
   return {...common,type:'activity',experienceId:r.experienceId as ExperienceId,date:r.date!,time:r.time!,participants:participants.filter(p=>p.itemId===r.id).map(p=>({id:p.domainId,...(p.weightKg===null?{}:{weightKg:p.weightKg})}))};
  };
  return {schemaVersion:2,id:b.id,reference:b.reference,status:b.status as BookingRequest['status'],createdAt:b.createdAt.toISOString(),locale:b.locale as Locale,customer:{name:b.customerName,email:b.email,phone:b.phone,...(b.preferredChannel?{preferredChannel:b.preferredChannel as ContactChannel}:{}),...(b.channelIdentity!==null?{channelIdentity:b.channelIdentity}:{})},...(b.notes!==null?{notes:b.notes}:{}),items:rows.filter(r=>r.parentId===null).map(item)};
 }
}
