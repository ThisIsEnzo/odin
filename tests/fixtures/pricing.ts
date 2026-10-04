// Synthetic test data only. Never imported by production code or published as business prices.
import {experiences} from '@/data/odin/experiences';
import {packages} from '@/data/odin/packages';
import {createActivity} from '@/lib/booking/itinerary';
import type {BookingDraft,Experience,ExperienceId,Package} from '@/types/domain';
export const catalog:Experience[]=experiences.map(e=>({...e,durationOptions:[{durationMinutes:60,price:{amount:100,currency:'THB',unit:'person'},quantityBasis:'participant'},{durationMinutes:90,price:{amount:175,currency:'THB',unit:'person'},quantityBasis:'participant'}]}));
export const packageCatalog:Package[]=packages.map(p=>({...p,price:{amount:500,currency:'THB',unit:'group'},mock:{isMock:false},estimateBasis:'package'}));
export function activity(id:ExperienceId='atv',durationMinutes=60,count=2){const a=createActivity(id,new Date(Date.now()+5*86400000).toISOString().slice(0,10));a.time='10:00';a.durationMinutes=durationMinutes;a.participants=Array.from({length:count},()=>({id:crypto.randomUUID(),...(id==='horse-riding'||id==='pony-riding'?{weightKg:30}:{})}));return a;}
export function draft():BookingDraft{return {schemaVersion:2,items:[activity()],locale:'en',customer:{name:'Test Guest',email:'test@example.com',phone:'+66000000000'}};}
