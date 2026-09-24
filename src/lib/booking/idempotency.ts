import {createHash,randomUUID} from 'node:crypto';
import type {BookingDraft} from '@/types/domain';
export class IdempotencyConflict extends Error {constructor(){super('idempotency_conflict');}}
export const validIdempotencyKey=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function canonical(v:unknown):unknown {
 if(Array.isArray(v))return v.map(canonical);
 if(v && typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)]));
 return v;
}
export const fingerprint=(draft:BookingDraft)=>createHash('sha256').update(JSON.stringify(canonical(draft))).digest('hex');
export const bookingReference=()=>`ODIN-${randomUUID().replaceAll('-','').toUpperCase()}`;
