import { z } from "zod";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import { bookingOptions } from "@/data/odin/booking-options";
import { siteConfig } from "@/data/odin/site";
import { validateVisit, validateContactPreference } from "@/lib/booking/rules";
export { MAX_BOOKING_WINDOW_DAYS } from "@/lib/booking/rules";

const id = z.string().min(1, "invalidSubmission").max(100, "invalidSubmission");
const options = z.array(z.object({ optionId: id, quantity: z.number().int("invalidOption") })).max(50, "invalidOption");
const participant = z.object({ id, weightKg: z.number().positive("weightRequired").optional() });
export const activityShape = z.object({
  id, type: z.literal("activity"), experienceId: z.enum(["horse-riding", "pony-riding", "atv", "sauna"], {message:"invalidExperience"}),
  date: z.string(), time: z.string(), durationMinutes: z.number().int("invalidDuration").positive("invalidDuration").optional(), participants: z.array(participant).max(200,"requestTooLarge"), options,
});
const itemShape = z.discriminatedUnion("type", [activityShape, z.object({
  id, type: z.literal("package"), packageId: id, components: z.array(activityShape).max(50,"requestTooLarge"), options,
})]);
export const visitSchema = z.array(itemShape).max(50,"requestTooLarge").superRefine((items,ctx) => {
  for (const issue of validateVisit(items,experiences,packages,bookingOptions)) ctx.addIssue({code:"custom",path:issue.path.slice(1),message:issue.key,params:issue.params});
});
export const customerSchema = z.object({
  name: z.string().trim().min(1,"nameRequired").max(120,"nameRequired"),
  email: z.string().trim().email("invalidEmail"),
  phone: z.string().trim().min(6,"invalidPhone").max(30,"invalidPhone"),
  preferredChannel: z.enum(["phone","email","line","whatsapp"]).optional(),
  channelIdentity: z.string().trim().max(120,"invalidSubmission").optional(),
}).superRefine((customer,ctx) => {
  for (const issue of validateContactPreference(customer,siteConfig)) ctx.addIssue({code:"custom",path:issue.path.slice(1),message:issue.key});
});
export const bookingSchema = z.object({
  schemaVersion:z.literal(2), items:visitSchema, customer:customerSchema,
  notes:z.string().trim().max(500,"notesTooLong").optional(),
  locale:z.enum(["en","th","ru","zh"]), company:z.string().max(0,"invalidSubmission").optional(),
});
export type BookingInput = z.input<typeof bookingSchema>;
export type BookingValidated = z.output<typeof bookingSchema>;
export type FieldErrorEntry = {key:string;params?:Record<string,unknown>};
export function collectFieldErrors(issues: {path: PropertyKey[]; message:string; params?:Record<string,unknown>}[]):Record<string,FieldErrorEntry> {
  const out:Record<string,FieldErrorEntry>={};
  for(const issue of issues) { const path=issue.path.map(String).join("."); out[path] ??= {key:issue.message,params:issue.params}; }
  return out;
}
