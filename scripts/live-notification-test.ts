import {readBookingConfig} from '../src/lib/booking/config';
import {planDeliveries} from '../src/lib/booking/outbox/plan';
import {createDeliveryTransport} from '../src/lib/booking/outbox/transport';
import {buildBookingNotificationPayload} from '../src/lib/booking/notify';
import {bookingReference} from '../src/lib/booking/idempotency';
import {createActivity} from '../src/lib/booking/itinerary';
async function main(){
 if(process.env.LIVE_NOTIFICATION_TEST!=='1')throw new Error('Live tests disabled; set explicit flag only with authorized test destination');
 const config=readBookingConfig({...process.env,NODE_ENV:'production'});
 // One channel + one recipient avoids accidental broadcast/spam during setup.
 if(config.targets.length!==1)throw new Error('Live test requires exactly one explicitly configured recipient/channel');
 const activity=createActivity('atv',new Date().toISOString().slice(0,10));activity.time='10:00';
 const payload=buildBookingNotificationPayload({schemaVersion:2,id:crypto.randomUUID(),reference:bookingReference(),status:'received',createdAt:new Date().toISOString(),locale:'en',customer:{name:'ODIN TEST — NOT A BOOKING',email:'test@example.com',phone:'TEST ONLY'},notes:'Authorized integration test. Do not reserve availability.',items:[activity]});
 const plans=planDeliveries(payload,config.targets);
 if(plans.length!==1)throw new Error('Test must fit in one provider message');
 const result=await createDeliveryTransport()(plans[0]!,crypto.randomUUID());
 console.info({provider:plans[0]!.provider,reference:payload.reference,status:'accepted',providerMessageId:result.providerMessageId});
}
main().catch(()=>{console.error('Live test not sent or provider rejected it; verify explicit flag, configuration, destination and account setup.');process.exitCode=1;});
