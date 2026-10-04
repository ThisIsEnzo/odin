import {sql} from 'drizzle-orm';
import {pgTable,uuid,text,integer,timestamp,jsonb,uniqueIndex,unique,index,check,foreignKey,doublePrecision} from 'drizzle-orm/pg-core';
import type {BookingEstimate} from '@/types/domain';
import type {BookingNotificationPayload} from '../booking/notify';
import type {DeliveryPlan} from '../booking/outbox/plan';
const stamp=(name:string)=>timestamp(name,{withTimezone:true,mode:'date'});
export const bookings=pgTable('bookings',{
 id:uuid('id').primaryKey(),reference:text('reference').notNull().unique(),status:text('status').notNull().default('received'),
 estimate:jsonb('estimate').$type<BookingEstimate>(),
 schemaVersion:integer('schema_version').notNull().default(2),locale:text('locale').notNull(),
 customerName:text('customer_name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),
 preferredChannel:text('preferred_channel'),channelIdentity:text('channel_identity'),notes:text('notes'),
 idempotencyKey:uuid('idempotency_key').notNull().unique(),requestHash:text('request_hash').notNull(),
 createdAt:stamp('created_at').notNull().defaultNow(),updatedAt:stamp('updated_at').notNull().defaultNow(),
},t=>[check('booking_status',sql`${t.status} in ('received','confirmed','declined','cancelled')`),check('booking_version',sql`${t.schemaVersion}=2`),check('booking_locale',sql`${t.locale} in ('en','ru','th','zh')`)]);
export const bookingItems=pgTable('booking_items',{
 id:uuid('id').primaryKey(),bookingId:uuid('booking_id').notNull().references(()=>bookings.id,{onDelete:'cascade'}),
 domainId:text('domain_id').notNull(),parentId:uuid('parent_id'),position:integer('position').notNull(),
 durationMinutes:integer('duration_minutes'),
 type:text('type').notNull(),experienceId:text('experience_id'),packageId:text('package_id'),date:text('date'),time:text('time'),
},t=>[
 uniqueIndex('item_domain_id').on(t.bookingId,t.domainId),unique('item_booking_id').on(t.bookingId,t.id),
 uniqueIndex('item_root_order').on(t.bookingId,t.position).where(sql`${t.parentId} is null`),
 uniqueIndex('item_child_order').on(t.parentId,t.position).where(sql`${t.parentId} is not null`),
 foreignKey({columns:[t.bookingId,t.parentId],foreignColumns:[t.bookingId,t.id]}),
 check('item_duration',sql`${t.durationMinutes} is null or (${t.type}='activity' and ${t.durationMinutes}>0)`),
 check('item_shape',sql`(${t.type}='activity' and ${t.experienceId} is not null and ${t.packageId} is null and ${t.date} is not null and ${t.time} is not null) or (${t.type}='package' and ${t.packageId} is not null and ${t.parentId} is null and ${t.experienceId} is null and ${t.date} is null and ${t.time} is null)`),check('item_position',sql`${t.position}>=0`),
]);
export const bookingParticipants=pgTable('booking_participants',{
 id:uuid('id').primaryKey(),itemId:uuid('item_id').notNull().references(()=>bookingItems.id,{onDelete:'cascade'}),domainId:text('domain_id').notNull(),position:integer('position').notNull(),weightKg:doublePrecision('weight_kg'),
},t=>[uniqueIndex('participant_order').on(t.itemId,t.position),uniqueIndex('participant_domain').on(t.itemId,t.domainId),check('participant_weight',sql`${t.weightKg} is null or (${t.weightKg}>0 and ${t.weightKg}<'Infinity'::float8)`)]);
export const bookingItemOptions=pgTable('booking_item_options',{
 id:uuid('id').primaryKey(),itemId:uuid('item_id').notNull().references(()=>bookingItems.id,{onDelete:'cascade'}),optionId:text('option_id').notNull(),position:integer('position').notNull(),quantity:integer('quantity').notNull(),
},t=>[uniqueIndex('option_order').on(t.itemId,t.position),uniqueIndex('option_unique').on(t.itemId,t.optionId),check('option_quantity',sql`${t.quantity}>0`)]);
export const notificationOutbox=pgTable('notification_outbox',{
 id:uuid('id').primaryKey(),bookingId:uuid('booking_id').notNull().references(()=>bookings.id,{onDelete:'cascade'}),eventType:text('event_type').notNull(),
 payload:jsonb('payload').$type<BookingNotificationPayload>().notNull(),status:text('status').notNull().default('pending'),createdAt:stamp('created_at').notNull().defaultNow(),processedAt:stamp('processed_at'),
},t=>[uniqueIndex('booking_event').on(t.bookingId,t.eventType),check('outbox_status',sql`${t.status} in ('pending','sent','partial','dead')`)]);
export const notificationDeliveries=pgTable('notification_deliveries',{
 id:uuid('id').primaryKey(),outboxId:uuid('outbox_id').notNull().references(()=>notificationOutbox.id,{onDelete:'cascade'}),provider:text('provider').notNull(),target:text('target').notNull(),part:integer('part').notNull(),
 plan:jsonb('plan').$type<DeliveryPlan>().notNull(),retryKey:uuid('retry_key').notNull(),status:text('status').notNull().default('pending'),attempts:integer('attempts').notNull().default(0),
 nextAttemptAt:stamp('next_attempt_at').notNull().defaultNow(),firstAttemptAt:stamp('first_attempt_at'),lastError:text('last_error'),providerMessageId:text('provider_message_id'),sentAt:stamp('sent_at'),
},t=>[uniqueIndex('delivery_part').on(t.outboxId,t.provider,t.target,t.part),index('delivery_due').on(t.status,t.nextAttemptAt),check('delivery_status',sql`${t.status} in ('pending','sent','dead')`)]);
