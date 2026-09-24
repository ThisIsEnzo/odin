import {sql,eq,and,asc,lte} from 'drizzle-orm';
import type {Database} from '../../db/client';
import {notificationOutbox as outbox,notificationDeliveries as deliveries} from '../../db/schema';
import {ProviderError} from '../providers/http';
import type {DeliveryTransport} from './transport';
export const RETRY_POLICY={maxAttempts:6,baseDelayMs:60000,maxDelayMs:3600000,maxBatch:5,maxRunMs:45000,lineMaxAgeMs:23*3600000} as const;
export const retryDelay=(attempt:number)=>Math.min(RETRY_POLICY.maxDelayMs,RETRY_POLICY.baseDelayMs*2**(attempt-1));
export class OutboxProcessor {
 constructor(private db:Database,private transport:DeliveryTransport){}
 async process(limit:number=RETRY_POLICY.maxBatch,bookingId?:string){
  const started=Date.now();let processed=0;
  for(let i=0;i<Math.min(Math.max(0,limit),RETRY_POLICY.maxBatch)&&Date.now()-started<RETRY_POLICY.maxRunMs;i++){
   const did=await this.processOne(bookingId);if(!did)break;processed++;
  }
  return {processed};
 }
 private async processOne(bookingId?:string){
  return this.db.transaction(async tx=>{
   // Keep this row lock across ONE bounded HTTP request. A second worker skips the event.
   // No lease can expire mid-send. A process crash releases the DB lock automatically.
   const [event]=await tx.select().from(outbox).where(and(bookingId?eq(outbox.bookingId,bookingId):undefined,
    sql`exists(select 1 from notification_deliveries d where d.outbox_id=${outbox.id} and d.status='pending' and d.next_attempt_at<=now())`
   )).orderBy(asc(outbox.createdAt)).limit(1).for('update',{skipLocked:true});
   if(!event)return false;
   const [delivery]=await tx.select().from(deliveries).where(and(eq(deliveries.outboxId,event.id),eq(deliveries.status,'pending'),lte(deliveries.nextAttemptAt,new Date()))).orderBy(asc(deliveries.part)).limit(1);
   if(!delivery)return false;
   const attempts=delivery.attempts+1,now=new Date();
   try{
    if(delivery.attempts>=RETRY_POLICY.maxAttempts)throw new ProviderError('max_attempts',false);
    // Conservative deadline starts at durable event creation, including crash/rollback windows.
    if(delivery.provider==='line'&&now.getTime()-event.createdAt.getTime()>RETRY_POLICY.lineMaxAgeMs)throw new ProviderError('line_retry_window_expired',false);
    const result=await this.transport(delivery.plan,delivery.retryKey);
    await tx.update(deliveries).set({status:'sent',attempts,firstAttemptAt:delivery.firstAttemptAt??now,sentAt:now,lastError:null,providerMessageId:result.providerMessageId}).where(eq(deliveries.id,delivery.id));
   }catch(error){
    const failure=error instanceof ProviderError?error:new ProviderError('transport_failure',true);
    const dead=!failure.retryable||attempts>=RETRY_POLICY.maxAttempts;
    await tx.update(deliveries).set({status:dead?'dead':'pending',attempts,firstAttemptAt:delivery.firstAttemptAt??now,lastError:failure.code,nextAttemptAt:new Date(now.getTime()+retryDelay(attempts))}).where(eq(deliveries.id,delivery.id));
   }
   const states=await tx.select({status:deliveries.status}).from(deliveries).where(eq(deliveries.outboxId,event.id));
   const pending=states.some(s=>s.status==='pending'),sent=states.some(s=>s.status==='sent'),dead=states.some(s=>s.status==='dead');
   await tx.update(outbox).set({status:pending?'pending':dead?(sent?'partial':'dead'):'sent',processedAt:pending?null:now}).where(eq(outbox.id,event.id));
   return true;
  });
 }
}
