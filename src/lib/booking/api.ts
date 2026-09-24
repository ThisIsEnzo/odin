import {NextResponse} from 'next/server';
import {bookingSchema,collectFieldErrors} from '../validation/booking.schema';
import {IdempotencyConflict,validIdempotencyKey} from './idempotency';
import {ConfigurationError} from './config';
import type {BookingRuntime} from './runtime';
export function createBookingHandler(runtime:()=>BookingRuntime){return async(req:Request)=>{
 let body:unknown;
 try{const raw=await req.text();if(raw.length>256000)return NextResponse.json({error:'request_too_large'},{status:413});body=JSON.parse(raw);}catch{return NextResponse.json({error:'invalid_body'},{status:400});}
 const parsed=bookingSchema.safeParse(body);
 if(!parsed.success)return NextResponse.json({error:'validation_failed',fieldErrors:collectFieldErrors(parsed.error.issues)},{status:400});
 const key=req.headers.get('Idempotency-Key')??'';
 if(!validIdempotencyKey(key))return NextResponse.json({error:'invalid_idempotency_key'},{status:400});
 const {company,...draft}=parsed.data;void company;
 try{
  const service=runtime();const created=await service.repository.create(draft,{idempotencyKey:key.toLowerCase()});
  try{await service.afterCreate(created.id);}catch{console.error('[booking:outbox] immediate processing failed; scheduled work retained');}
  return NextResponse.json({status:'received',id:created.id,reference:created.reference},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){
  if(error instanceof IdempotencyConflict)return NextResponse.json({error:'idempotency_conflict'},{status:409});
  console.error('[booking:persistence]',{category:error instanceof ConfigurationError?'configuration':'storage'});
  return NextResponse.json({error:'submission_failed'},{status:503});
 }
};}
