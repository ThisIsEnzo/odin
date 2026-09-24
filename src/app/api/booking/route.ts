import { NextResponse } from "next/server";
import { bookingSchema, collectFieldErrors } from "@/lib/validation/booking.schema";
import { InMemoryBookingRepository } from "@/lib/booking/repository";
import { createNotificationService } from "@/lib/booking/notification-config";
import { submitBooking } from "@/lib/booking/submit";
export const runtime="nodejs";
const repository=new InMemoryBookingRepository();
const notifications=createNotificationService();
export async function POST(req:Request) {
  let body:unknown;
  try { const raw=await req.text(); if(raw.length>256000) return NextResponse.json({error:"request_too_large"},{status:413}); body=JSON.parse(raw); }
  catch {return NextResponse.json({error:"invalid_body"},{status:400});}
  const parsed=bookingSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"validation_failed",fieldErrors:collectFieldErrors(parsed.error.issues)},{status:400});
  const {company,...draft}=parsed.data;
  void company;
  try {
    const created=await submitBooking(draft,repository,notifications);
    return NextResponse.json({status:"received",id:created.id},{status:201});
  } catch { console.error("[booking:persistence] failed"); return NextResponse.json({error:"submission_failed"},{status:500}); }
}
