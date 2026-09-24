CREATE TABLE "booking_item_options" (
	"id" uuid PRIMARY KEY NOT NULL,
	"item_id" uuid NOT NULL,
	"option_id" text NOT NULL,
	"position" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "option_quantity" CHECK ("booking_item_options"."quantity">0)
);
--> statement-breakpoint
CREATE TABLE "booking_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"domain_id" text NOT NULL,
	"parent_id" uuid,
	"position" integer NOT NULL,
	"type" text NOT NULL,
	"experience_id" text,
	"package_id" text,
	"date" text,
	"time" text,
	CONSTRAINT "item_booking_id" UNIQUE("booking_id","id"),
	CONSTRAINT "item_shape" CHECK (("booking_items"."type"='activity' and "booking_items"."experience_id" is not null and "booking_items"."package_id" is null and "booking_items"."date" is not null and "booking_items"."time" is not null) or ("booking_items"."type"='package' and "booking_items"."package_id" is not null and "booking_items"."parent_id" is null and "booking_items"."experience_id" is null and "booking_items"."date" is null and "booking_items"."time" is null)),
	CONSTRAINT "item_position" CHECK ("booking_items"."position">=0)
);
--> statement-breakpoint
CREATE TABLE "booking_participants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"item_id" uuid NOT NULL,
	"domain_id" text NOT NULL,
	"position" integer NOT NULL,
	"weight_kg" double precision,
	CONSTRAINT "participant_weight" CHECK ("booking_participants"."weight_kg" is null or ("booking_participants"."weight_kg">0 and "booking_participants"."weight_kg"<'Infinity'::float8))
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"schema_version" integer DEFAULT 2 NOT NULL,
	"locale" text NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"preferred_channel" text,
	"channel_identity" text,
	"notes" text,
	"idempotency_key" uuid NOT NULL,
	"request_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference"),
	CONSTRAINT "bookings_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "booking_status" CHECK ("bookings"."status" in ('received','confirmed','declined','cancelled')),
	CONSTRAINT "booking_version" CHECK ("bookings"."schema_version"=2),
	CONSTRAINT "booking_locale" CHECK ("bookings"."locale" in ('en','ru','th','zh'))
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"outbox_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"target" text NOT NULL,
	"part" integer NOT NULL,
	"plan" jsonb NOT NULL,
	"retry_key" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_attempt_at" timestamp with time zone,
	"last_error" text,
	"provider_message_id" text,
	"sent_at" timestamp with time zone,
	CONSTRAINT "delivery_status" CHECK ("notification_deliveries"."status" in ('pending','sent','dead'))
);
--> statement-breakpoint
CREATE TABLE "notification_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "outbox_status" CHECK ("notification_outbox"."status" in ('pending','sent','partial','dead'))
);
--> statement-breakpoint
ALTER TABLE "booking_item_options" ADD CONSTRAINT "booking_item_options_item_id_booking_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."booking_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_parent_id_booking_items_booking_id_id_fk" FOREIGN KEY ("booking_id","parent_id") REFERENCES "public"."booking_items"("booking_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_item_id_booking_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."booking_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_outbox_id_notification_outbox_id_fk" FOREIGN KEY ("outbox_id") REFERENCES "public"."notification_outbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "option_order" ON "booking_item_options" USING btree ("item_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "option_unique" ON "booking_item_options" USING btree ("item_id","option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_domain_id" ON "booking_items" USING btree ("booking_id","domain_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_root_order" ON "booking_items" USING btree ("booking_id","position") WHERE "booking_items"."parent_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "item_child_order" ON "booking_items" USING btree ("parent_id","position") WHERE "booking_items"."parent_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_order" ON "booking_participants" USING btree ("item_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_domain" ON "booking_participants" USING btree ("item_id","domain_id");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_part" ON "notification_deliveries" USING btree ("outbox_id","provider","target","part");--> statement-breakpoint
CREATE INDEX "delivery_due" ON "notification_deliveries" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_event" ON "notification_outbox" USING btree ("booking_id","event_type");