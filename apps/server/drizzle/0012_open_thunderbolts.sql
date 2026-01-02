CREATE TYPE "my_schema"."gdpr_action_type" AS ENUM('data_export', 'data_deletion', 'data_access', 'consent_update', 'data_rectification');--> statement-breakpoint
CREATE TYPE "my_schema"."gdpr_audit_status" AS ENUM('success', 'failure', 'partial');--> statement-breakpoint
CREATE TYPE "my_schema"."gdpr_export_format" AS ENUM('json', 'csv');--> statement-breakpoint
CREATE TYPE "my_schema"."sync_collection_names" AS ENUM('announcements', 'notifications', 'support-tickets', 'coupons', 'reviews', 'courses', 'chat-reports', 'searchable-users');--> statement-breakpoint
CREATE TYPE "my_schema"."sync_state" AS ENUM('synced', 'syncing', 'offline', 'error');--> statement-breakpoint
CREATE TABLE "my_schema"."gdpr_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action_type" "my_schema"."gdpr_action_type" NOT NULL,
	"status" "my_schema"."gdpr_audit_status" NOT NULL,
	"export_format" "my_schema"."gdpr_export_format",
	"ip_address" varchar(45),
	"user_agent" text,
	"error_message" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."sync_status" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"collection_name" "my_schema"."sync_collection_names" NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_event_id" text,
	"sync_state" "my_schema"."sync_state" DEFAULT 'synced' NOT NULL,
	"pending_updates" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"is_online" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my_schema"."gdpr_audit_log" ADD CONSTRAINT "gdpr_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."sync_status" ADD CONSTRAINT "sync_status_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gdpr_audit_log_user_id_idx" ON "my_schema"."gdpr_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gdpr_audit_log_action_type_idx" ON "my_schema"."gdpr_audit_log" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "gdpr_audit_log_status_idx" ON "my_schema"."gdpr_audit_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gdpr_audit_log_created_at_idx" ON "my_schema"."gdpr_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sync_status_user_id_idx" ON "my_schema"."sync_status" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_status_collection_idx" ON "my_schema"."sync_status" USING btree ("collection_name");--> statement-breakpoint
CREATE INDEX "sync_status_user_collection_idx" ON "my_schema"."sync_status" USING btree ("user_id","collection_name");