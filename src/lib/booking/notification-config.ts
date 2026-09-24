import {ConsoleNotificationProvider,FanoutNotificationService,type NotificationProvider} from "./notify";
import {LineNotificationProvider} from "./providers/line";
import {WhatsAppNotificationProvider} from "./providers/whatsapp";
/** Server-only composition. Never imported by client components. */
export function createNotificationService(env:NodeJS.ProcessEnv=process.env) {
  const providers:NotificationProvider[]=[];
  const channels=(env.BOOKING_NOTIFICATION_CHANNELS ?? "console").split(",").map(v=>v.trim()).filter(Boolean);
  for(const channel of new Set(channels)) {
    if(channel==="console") providers.push(new ConsoleNotificationProvider());
    else if(channel==="line") providers.push(new LineNotificationProvider({token:env.LINE_CHANNEL_ACCESS_TOKEN??"",recipientId:env.LINE_STAFF_RECIPIENT_ID??""}));
    else if(channel==="whatsapp") providers.push(new WhatsAppNotificationProvider({token:env.WHATSAPP_ACCESS_TOKEN??"",phoneNumberId:env.WHATSAPP_PHONE_NUMBER_ID??"",recipient:env.WHATSAPP_STAFF_RECIPIENT??"",apiVersion:env.WHATSAPP_GRAPH_API_VERSION??"",templateName:env.WHATSAPP_TEMPLATE_NAME??"",templateLanguage:env.WHATSAPP_TEMPLATE_LANGUAGE??""}));
    else providers.push({name:channel,async send(){throw new Error("Unknown channel");}});
  }
  return new FanoutNotificationService(providers);
}
