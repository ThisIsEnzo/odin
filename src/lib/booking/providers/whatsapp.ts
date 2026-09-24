import type {BookingNotificationPayload,NotificationProvider} from "../notify";
import {chunks,postProvider,type Fetcher} from "./http";
/** Approved template parameters: reference, part number, details.
 * No assumption that a 24h conversation window is open. Approval required. */
export class WhatsAppNotificationProvider implements NotificationProvider {
  name="whatsapp";
  constructor(private config:{token:string;phoneNumberId:string;recipient:string;apiVersion:string;templateName:string;templateLanguage:string},private fetcher:Fetcher=fetch) {}
  async send(payload:BookingNotificationPayload) {
    const c=this.config;
    if(Object.values(c).some(v=>!v) || !/^v\d+\.\d+$/.test(c.apiVersion) || !/^\d+$/.test(c.phoneNumberId) || !/^\d+$/.test(c.recipient)) throw new Error("WhatsApp is not configured");
    const parts=chunks(payload.text.replace(/\s+/g," "),800);
    for(let i=0;i<parts.length;i++) await postProvider(this.fetcher,`https://graph.facebook.com/${c.apiVersion}/${c.phoneNumberId}/messages`,c.token,{
      messaging_product:"whatsapp",to:c.recipient,type:"template",template:{name:c.templateName,language:{code:c.templateLanguage},components:[{type:"body",parameters:[payload.reference,`${i+1}/${parts.length}`,parts[i]!].map(text=>({type:"text",text}))}]},
    });
  }
}
