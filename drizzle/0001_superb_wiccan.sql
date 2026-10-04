ALTER TABLE "booking_items" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "estimate" jsonb;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "item_duration" CHECK ("booking_items"."duration_minutes" is null or ("booking_items"."type"='activity' and "booking_items"."duration_minutes">0));