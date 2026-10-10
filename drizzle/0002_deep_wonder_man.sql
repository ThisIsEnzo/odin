CREATE TABLE "booking_request_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"activity_id" text NOT NULL,
	"position" integer NOT NULL,
	"guest_count" integer NOT NULL,
	"duration_minutes" integer,
	"unit_count" integer,
	CONSTRAINT "request_activity_counts" CHECK ("booking_request_activities"."guest_count">0 and ("booking_request_activities"."unit_count" is null or ("booking_request_activities"."unit_count">0 and "booking_request_activities"."unit_count"<="booking_request_activities"."guest_count"))),
	CONSTRAINT "request_activity_duration" CHECK ("booking_request_activities"."duration_minutes" is null or "booking_request_activities"."duration_minutes">0),
	CONSTRAINT "request_activity_position" CHECK ("booking_request_activities"."position">=0)
);
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "booking_version";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "visit_date" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "preferred_start_time" text;--> statement-breakpoint
ALTER TABLE "booking_request_activities" ADD CONSTRAINT "booking_request_activities_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "request_activity" ON "booking_request_activities" USING btree ("booking_id","activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "request_activity_order" ON "booking_request_activities" USING btree ("booking_id","position");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_v3_visit" CHECK ("bookings"."schema_version"<>3 or ("bookings"."visit_date" is not null and "bookings"."preferred_start_time" is not null));--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_version" CHECK ("bookings"."schema_version" in (2,3));