-- Migration: Add GDPR audit log table
-- This table tracks all GDPR-related actions for compliance purposes

-- Create GDPR action type enum
DO $$ BEGIN
 CREATE TYPE "my_schema"."gdpr_action_type" AS ENUM('data_export', 'data_deletion', 'data_access', 'consent_update', 'data_rectification');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create GDPR export format enum
DO $$ BEGIN
 CREATE TYPE "my_schema"."gdpr_export_format" AS ENUM('json', 'csv');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create GDPR audit status enum
DO $$ BEGIN
 CREATE TYPE "my_schema"."gdpr_audit_status" AS ENUM('success', 'failure', 'partial');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create GDPR audit log table
CREATE TABLE IF NOT EXISTS "my_schema"."gdpr_audit_log" (
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

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "my_schema"."gdpr_audit_log" ADD CONSTRAINT "gdpr_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "gdpr_audit_log_user_id_idx" ON "my_schema"."gdpr_audit_log" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "gdpr_audit_log_action_type_idx" ON "my_schema"."gdpr_audit_log" USING btree ("action_type");
CREATE INDEX IF NOT EXISTS "gdpr_audit_log_status_idx" ON "my_schema"."gdpr_audit_log" USING btree ("status");
CREATE INDEX IF NOT EXISTS "gdpr_audit_log_created_at_idx" ON "my_schema"."gdpr_audit_log" USING btree ("created_at");
