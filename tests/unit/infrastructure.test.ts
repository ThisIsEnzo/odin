import {describe,it,expect,vi} from 'vitest';
import {readBookingConfig} from '@/lib/booking/config';
import {fingerprint,IdempotencyConflict} from '@/lib/booking/idempotency';
import {InMemoryBookingRepository} from '@/lib/booking/repository';
import {createActivity} from '@/lib/booking/itinerary';
import {createBookingHandler} from '@/lib/booking/api';
import {buildBookingNotificationPayload} from '@/lib/booking/notify';
import {createDeliveryTransport} from '@/lib/booking/outbox/transport';
import {planDeliveries,type DeliveryPlan} from '@/lib/booking/outbox/plan';
import {retryDelay,RETRY_POLICY} from '@/lib/booking/outbox/processor';
import {ProviderError,PROVIDER_TIMEOUT_MS} from '@/lib/booking/providers/http';
import {authorizedProcessor} from '@/lib/booking/internal-auth';
import type {BookingDraft,BookingRequestDraft} from '@/types/domain';
function draft():BookingDraft{const a=createActivity('atv',new Date(Date.now()+5*86400000).toISOString().slice(0,10));a.time='10:00';return {schemaVersion:2,locale:'en',items:[a],customer:{name:'Test Only',email:'qa@example.com',phone:'+66000000000'}};}
const line:DeliveryPlan={provider:'line',target:'TEST',part:0,body:{to:'TEST',messages:[{type:'text',text:'TEST ONLY'}]}};
const whatsapp:DeliveryPlan={provider:'whatsapp',target:'123456789',part:0,apiVersion:'v99.0',phoneNumberId:'1234',body:{messaging_product:'whatsapp',to:'123456789',type:'template',template:{name:'test_only',language:{code:'en'},components:[]}}};
const env={NODE_ENV:'test',LINE_CHANNEL_ACCESS_TOKEN:'test-only',WHATSAPP_ACCESS_TOKEN:'test-only',WHATSAPP_STAFF_OPT_IN_CONFIRMED:'1'} as NodeJS.ProcessEnv;
describe('configuration and idempotency',()=>{
 it('production fails closed without DB',()=>expect(()=>readBookingConfig({NODE_ENV:'production'})).toThrow('DATABASE_URL'));
 it('production never permits memory',()=>expect(()=>readBookingConfig({NODE_ENV:'production',BOOKING_STORAGE:'memory'})).toThrow('BOOKING_STORAGE'));
 it('explicit dev memory uses console only',()=>expect(readBookingConfig({NODE_ENV:'test',BOOKING_STORAGE:'memory'}).targets).toEqual([{provider:'console',target:'local'}]));
 it('production requires real channels and processor secret',()=>{const e={NODE_ENV:'production',DATABASE_URL:'postgres://localhost/odin'} as NodeJS.ProcessEnv;expect(()=>readBookingConfig(e)).toThrow('BOOKING_NOTIFICATION_CHANNELS');expect(()=>readBookingConfig({...e,BOOKING_NOTIFICATION_CHANNELS:'line',LINE_CHANNEL_ACCESS_TOKEN:'test',LINE_STAFF_RECIPIENT_ID:'U'+'a'.repeat(32)})).toThrow('NOTIFICATION_PROCESS_SECRET');});
 it('multiple targets deduplicate',()=>{const c=readBookingConfig({NODE_ENV:'test',DATABASE_URL:'postgres://localhost/odin',BOOKING_NOTIFICATION_CHANNELS:'line',LINE_CHANNEL_ACCESS_TOKEN:'test',LINE_STAFF_RECIPIENT_ID:['U'+'a'.repeat(32),'C'+'b'.repeat(32),'U'+'a'.repeat(32)].join(','),NOTIFICATION_PROCESS_SECRET:'x'.repeat(32)});expect(c.targets).toHaveLength(2);});
 it('fingerprint ignores object-key order but not itinerary order',()=>{const d=draft();expect(fingerprint(d)).toBe(fingerprint({customer:d.customer,items:d.items,locale:d.locale,schemaVersion:2}));expect(fingerprint({...d,notes:'changed'})).not.toBe(fingerprint(d));});
 it('memory preserves idempotency semantics for isolated tests',async()=>{const repo=new InMemoryBookingRepository(),d=draft(),key=crypto.randomUUID();const a=await repo.create(d,{idempotencyKey:key}),b=await repo.create(d,{idempotencyKey:key});expect(a).toEqual(b);await expect(repo.create({...d,notes:'changed'},{idempotencyKey:key})).rejects.toBeInstanceOf(IdempotencyConflict);});
 it('processor auth rejects missing/wrong/short secrets',()=>{const secret='a'.repeat(32);expect(authorizedProcessor(null,secret)).toBe(false);expect(authorizedProcessor('Bearer wrong',secret)).toBe(false);expect(authorizedProcessor('Bearer '+secret,secret)).toBe(true);expect(authorizedProcessor('Bearer short','short')).toBe(false);});
 it('retry delay is exponential and capped',()=>{expect(retryDelay(1)).toBe(60000);expect(retryDelay(2)).toBe(120000);expect(retryDelay(99)).toBe(RETRY_POLICY.maxDelayMs);});
});
describe.each([line,whatsapp])('$provider transport',plan=>{
 it('sends official authenticated envelope; retains provider ID',async()=>{const fetcher=vi.fn(async()=>new Response(JSON.stringify(plan.provider==='line'?{sentMessages:[{id:'msg'}]}:{messages:[{id:'msg'}]}),{status:200}));expect(await createDeliveryTransport(env,fetcher)(plan,'fixed-key')).toEqual({providerMessageId:'msg'});const [url,init]=fetcher.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe(plan.provider==='line'?'https://api.line.me/v2/bot/message/push':'https://graph.facebook.com/v99.0/1234/messages');expect(init.headers).toMatchObject({Authorization:'Bearer test-only'});expect(JSON.parse(init.body as string)).toEqual(plan.body);if(plan.provider==='line')expect(init.headers).toMatchObject({'X-Line-Retry-Key':'fixed-key'});});
 it.each([400,401,403,429,500,503])('classifies HTTP %s without leaking response',async status=>{const fetcher=vi.fn(async()=>new Response('secret provider detail',{status}));await expect(createDeliveryTransport(env,fetcher)(plan,'key')).rejects.toMatchObject({code:`provider_http_${status}`,retryable:status>=500||status===429});});
 it('network failures are sanitized and retryable',async()=>{await expect(createDeliveryTransport(env,async()=>{throw new Error('token=secret');})(plan,'key')).rejects.toMatchObject({code:'transport_timeout_or_network',retryable:true});});
 it('applies an abort timeout to HTTP',async()=>{let signal:AbortSignal|undefined;const transport=createDeliveryTransport(env,async(_url,init)=>{signal=init?.signal??undefined;throw new DOMException('timeout','TimeoutError');});await expect(transport(plan,'key')).rejects.toBeInstanceOf(ProviderError);expect(signal).toBeInstanceOf(AbortSignal);expect(PROVIDER_TIMEOUT_MS).toBe(10000);});
});
describe('payload and provider-specific safeguards',()=>{
 it('LINE duplicate acknowledgement is accepted',async()=>{const transport=createDeliveryTransport(env,async()=>new Response('{}',{status:409,headers:{'x-line-accepted-request-id':'original'}}));expect(await transport(line,'key')).toEqual({providerMessageId:'original'});});
 it('LINE arbitrary 409 is not treated as success',async()=>{await expect(createDeliveryTransport(env,async()=>new Response('{}',{status:409}))(line,'key')).rejects.toMatchObject({retryable:false});});
 it('missing credentials never call HTTP',async()=>{const fetcher=vi.fn();await expect(createDeliveryTransport({NODE_ENV:"test"},fetcher)(line,'key')).rejects.toThrow('provider_not_configured');expect(fetcher).not.toHaveBeenCalled();});
 it('WhatsApp requires opt-in and positive provider message ID',async()=>{await expect(createDeliveryTransport({...env,WHATSAPP_STAFF_OPT_IN_CONFIRMED:''})(whatsapp,'key')).rejects.toThrow('opt_in');await expect(createDeliveryTransport(env,async()=>new Response('{}'))(whatsapp,'key')).rejects.toThrow('missing_message_id');});
 it('long payload uses bounded complete numbered parts, without credentials',async()=>{const b=await new InMemoryBookingRepository().create(draft());const payload=buildBookingNotificationPayload(b);payload.text='X'.repeat(2000);const plans=planDeliveries(payload,[{provider:'whatsapp',target:'123',phoneNumberId:'456',apiVersion:'v99.0',templateName:'test',templateLanguage:'en'}]);expect(plans).toHaveLength(3);const bodies=plans.map(p=>p.body as {template:{components:{parameters:{text:string}[]}[]}});expect(bodies.map(b=>b.template.components[0]!.parameters[2]!.text).join('')).toBe(payload.text);expect(JSON.stringify(plans)).not.toContain('token');});
});
describe('API infrastructure behavior',()=>{
 const repository=new InMemoryBookingRepository();
 const make=(afterCreate=async(_id:string)=>{})=>createBookingHandler(()=>({repository,processSecret:'',process:async()=>({processed:0}),afterCreate}));
 const request=(d:BookingRequestDraft,key?:string)=>new Request('http://localhost/api/booking',{method:'POST',headers:key?{'Idempotency-Key':key}:{},body:JSON.stringify(d)});
 it('requires an idempotency key',async()=>expect((await make()(request(requestDraft()))).status).toBe(400));
 it('same key/body yields same reference; conflicting reuse is 409',async()=>{const d=requestDraft(),key=crypto.randomUUID(),post=make();const a=await (await post(request(d,key))).json(),b=await (await post(request(d,key))).json();expect(a).toEqual(b);expect(a.reference).toMatch(/^ODIN-/);expect((await post(request({...d,notes:'different'},key))).status).toBe(409);});
 it('notification failure never changes received',async()=>{const res=await make(async()=>{throw new Error('offline');})(request(requestDraft(),crypto.randomUUID()));expect(res.status).toBe(201);expect((await res.json()).status).toBe('received');});
 it('DB failure returns safe error and never attempts delivery',async()=>{const afterCreate=vi.fn();const post=createBookingHandler(()=>({repository:{create:async()=>{throw new Error('secret SQL');},getById:async()=>null},afterCreate,process:async()=>({processed:0}),processSecret:''}));const res=await post(request(requestDraft(),crypto.randomUUID()));expect(res.status).toBe(503);expect(await res.text()).not.toContain('secret');expect(afterCreate).not.toHaveBeenCalled();});
});

describe('internal endpoint',()=>{
 it('rejects unauthenticated calls before opening database',async()=>{const {POST}=await import('@/app/api/internal/notifications/process/route');expect((await POST(new Request('http://localhost/api/internal/notifications/process',{method:'POST'}))).status).toBe(401);});
});

function requestDraft():BookingRequestDraft {return {schemaVersion:3,visitDate:new Date(Date.now()+5*86400000).toISOString().slice(0,10),preferredStartTime:"10:00",customer:{fullName:"Test Only",email:"qa@example.com",phone:"+66000000000"},activities:[{activityId:"atv",durationMinutes:30,guestCount:5,unitCount:3}],locale:"en"};}
