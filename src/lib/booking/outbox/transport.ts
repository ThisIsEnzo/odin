import {postProvider,ProviderError,type Fetcher} from '../providers/http';
import type {DeliveryPlan} from './plan';
export type TransportResult={providerMessageId?:string};
export type DeliveryTransport=(plan:DeliveryPlan,retryKey:string)=>Promise<TransportResult>;
/** Frozen destination/body come from the outbox; only credentials come from current env. */
export function createDeliveryTransport(env:NodeJS.ProcessEnv=process.env,fetcher:Fetcher=fetch):DeliveryTransport {
 return async(plan,retryKey)=>{
  if(plan.provider==='console'){
   if(env.NODE_ENV==='production')throw new ProviderError('console_disabled_in_production',false);
   console.info('[booking:notification]',{reference:plan.body.reference,status:'accepted'});return {};
  }
  let url:string,token:string,headers:Record<string,string>={};
  if(plan.provider==='line'){
   url='https://api.line.me/v2/bot/message/push';token=env.LINE_CHANNEL_ACCESS_TOKEN??'';headers={'X-Line-Retry-Key':retryKey};
  }else{
   if(!/^v\d+\.\d+$/.test(plan.apiVersion??'')||!/^\d+$/.test(plan.phoneNumberId??''))throw new ProviderError('invalid_whatsapp_envelope',false);
   if(env.WHATSAPP_STAFF_OPT_IN_CONFIRMED!=='1')throw new ProviderError('whatsapp_opt_in_not_confirmed',false);
   url=`https://graph.facebook.com/${plan.apiVersion}/${plan.phoneNumberId}/messages`;token=env.WHATSAPP_ACCESS_TOKEN??'';
  }
  if(!token)throw new ProviderError('provider_not_configured',false);
  const response=await postProvider(fetcher,url,token,plan.body,headers);
  const replay=response.headers.get('x-line-accepted-request-id');
  const body=await response.json().catch(()=>({})) as {messages?:{id?:string}[];sentMessages?:{id?:string}[]};
  const id=body.messages?.[0]?.id??body.sentMessages?.[0]?.id??replay??response.headers.get('x-line-request-id');
  if(plan.provider==='whatsapp'&&!id)throw new ProviderError('provider_missing_message_id',true);
  return {providerMessageId:typeof id==='string'?id.slice(0,256):undefined};
 };
}
