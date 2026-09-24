import type {BookingNotificationPayload,NotificationProvider} from "../notify";
import {chunks,postProvider,type Fetcher} from "./http";
export class LineNotificationProvider implements NotificationProvider {
  name="line";
  constructor(private config:{token:string;recipientId:string},private fetcher:Fetcher=fetch) {}
  async send(payload:BookingNotificationPayload) {
    if(!this.config.token || !this.config.recipientId) throw new Error("LINE is not configured");
    const texts=chunks(payload.text,4500);
    for(let i=0;i<texts.length;i+=5) await postProvider(this.fetcher,"https://api.line.me/v2/bot/message/push",this.config.token,{
      to:this.config.recipientId,messages:texts.slice(i,i+5).map((text,j)=>({type:"text",text:`${payload.reference} [${i+j+1}/${texts.length}]\n${text}`})),
    },{"X-Line-Retry-Key":crypto.randomUUID()});
  }
}
