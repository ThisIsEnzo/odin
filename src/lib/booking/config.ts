import type {NotificationTarget} from './outbox/plan';
export class ConfigurationError extends Error {constructor(name:string){super(`Missing or invalid server configuration: ${name}`);}}
const requireValue=(env:NodeJS.ProcessEnv,name:string)=>{const v=env[name]?.trim();if(!v)throw new ConfigurationError(name);return v;};
const list=(v:string)=>[...new Set(v.split(',').map(s=>s.trim()).filter(Boolean))];
export function readBookingConfig(env:NodeJS.ProcessEnv=process.env){
 const production=env.NODE_ENV==='production';
 const storage=env.BOOKING_STORAGE??'postgres';
 if(!['postgres','memory'].includes(storage)||production&&storage==='memory')throw new ConfigurationError('BOOKING_STORAGE');
 const databaseUrl=storage==='postgres'?requireValue(env,'DATABASE_URL'):undefined;
 if(databaseUrl){try{const url=new URL(databaseUrl);if(!['postgres:','postgresql:'].includes(url.protocol))throw 0;}catch{throw new ConfigurationError('DATABASE_URL');}}
 const channels=list(env.BOOKING_NOTIFICATION_CHANNELS??(production?'':'console'));
 if(!channels.length||channels.some(c=>!['line','whatsapp','console'].includes(c))||production&&channels.includes('console'))throw new ConfigurationError('BOOKING_NOTIFICATION_CHANNELS');
 const targets:NotificationTarget[]=[];
 if(channels.includes('console'))targets.push({provider:'console',target:'local'});
 if(channels.includes('line')){
  requireValue(env,'LINE_CHANNEL_ACCESS_TOKEN');
  const recipients=list(requireValue(env,'LINE_STAFF_RECIPIENT_ID'));
  if(!recipients.length||recipients.length>10||recipients.some(r=>!/^([UCR])[0-9a-f]{32}$/i.test(r)))throw new ConfigurationError('LINE_STAFF_RECIPIENT_ID');
  for(const target of recipients)targets.push({provider:'line',target});
 }
 if(channels.includes('whatsapp')){
  requireValue(env,'WHATSAPP_ACCESS_TOKEN');
  if(env.WHATSAPP_STAFF_OPT_IN_CONFIRMED!=='1')throw new ConfigurationError('WHATSAPP_STAFF_OPT_IN_CONFIRMED');
  const phoneNumberId=requireValue(env,'WHATSAPP_PHONE_NUMBER_ID'),apiVersion=requireValue(env,'WHATSAPP_GRAPH_API_VERSION');
  const templateName=requireValue(env,'WHATSAPP_TEMPLATE_NAME'),templateLanguage=requireValue(env,'WHATSAPP_TEMPLATE_LANGUAGE');
  const recipients=list(requireValue(env,'WHATSAPP_STAFF_RECIPIENT'));
  if(!/^\d+$/.test(phoneNumberId)||!/^v\d+\.\d+$/.test(apiVersion)||!recipients.length||recipients.length>10||recipients.some(r=>!/^\d{7,15}$/.test(r))||!/^\w+$/.test(templateName)||!/^\w+$/.test(templateLanguage))throw new ConfigurationError('WHATSAPP configuration');
  for(const target of recipients)targets.push({provider:'whatsapp',target,phoneNumberId,apiVersion,templateName,templateLanguage});
 }
 if(storage==='memory'&&channels.some(c=>c!=='console'))throw new ConfigurationError('Memory mode supports console only');
 const processSecret=env.NOTIFICATION_PROCESS_SECRET??'';
 if(storage==='postgres'&&processSecret.length<32)throw new ConfigurationError('NOTIFICATION_PROCESS_SECRET (minimum 32 characters)');
 return {storage,databaseUrl,targets,processSecret};
}
