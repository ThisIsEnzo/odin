import type {BookingNotificationPayload} from '../notify';
import {chunks} from '../providers/http';
export type ProviderName='console'|'line'|'whatsapp';
export type NotificationTarget={provider:ProviderName;target:string;phoneNumberId?:string;apiVersion?:string;templateName?:string;templateLanguage?:string};
/** Frozen per-part transport envelope, never credentials. Safe to retry unchanged. */
export type DeliveryPlan={provider:ProviderName;target:string;part:number;body:Record<string,unknown>;phoneNumberId?:string;apiVersion?:string};
export function planDeliveries(payload:BookingNotificationPayload,targets:NotificationTarget[]):DeliveryPlan[] {
 return targets.flatMap(t=>{
  if(t.provider==='console')return [{provider:t.provider,target:t.target,part:0,body:{reference:payload.reference,items:payload.booking.schemaVersion===3?payload.booking.activities.length:payload.booking.items.length}}];
  const pieces=chunks(t.provider==='line'?payload.text:payload.text.replace(/\s+/g,' '),t.provider==='line'?4500:700);
  return pieces.map((text,i):DeliveryPlan=>({provider:t.provider,target:t.target,part:i,...(t.provider==='whatsapp'?{phoneNumberId:t.phoneNumberId,apiVersion:t.apiVersion}:{}),body:t.provider==='line'
   ?{to:t.target,messages:[{type:'text',text:`${payload.reference} [${i+1}/${pieces.length}]\n${text}`}]}
   :{messaging_product:'whatsapp',to:t.target,type:'template',template:{name:t.templateName,language:{code:t.templateLanguage},components:[{type:'body',parameters:[payload.reference,`${i+1}/${pieces.length}`,text].map(text=>({type:'text',text}))}]}}}));
 });
}
