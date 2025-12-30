CREATE TYPE "my_schema"."report_reason" AS ENUM('spam', 'harassment', 'inappropriate', 'offensive', 'violence', 'illegal', 'other');--> statement-breakpoint
CREATE TYPE "my_schema"."report_status" AS ENUM('pending', 'reviewed', 'dismissed', 'actioned');--> statement-breakpoint
ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_chat_message_reported';--> statement-breakpoint
CREATE TABLE "my_schema"."chat_message_report" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"reason" "my_schema"."report_reason" NOT NULL,
	"details" text,
	"message_content" text NOT NULL,
	"message_author" text NOT NULL,
	"status" "my_schema"."report_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_message_report_message_id_check" CHECK ("my_schema"."chat_message_report"."message_id" <> ''),
	CONSTRAINT "chat_message_report_channel_id_check" CHECK ("my_schema"."chat_message_report"."channel_id" <> ''),
	CONSTRAINT "chat_message_report_message_content_check" CHECK ("my_schema"."chat_message_report"."message_content" <> ''),
	CONSTRAINT "chat_message_report_message_author_check" CHECK ("my_schema"."chat_message_report"."message_author" <> ''),
	CONSTRAINT "chat_message_report_reviewed_check" CHECK (("my_schema"."chat_message_report"."status" IN ('reviewed', 'dismissed', 'actioned') AND "my_schema"."chat_message_report"."reviewed_at" IS NOT NULL AND "my_schema"."chat_message_report"."reviewed_by" IS NOT NULL) OR ("my_schema"."chat_message_report"."status" = 'pending' AND "my_schema"."chat_message_report"."reviewed_at" IS NULL AND "my_schema"."chat_message_report"."reviewed_by" IS NULL))
);
--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD COLUMN "chat_message_report_id" text;--> statement-breakpoint
ALTER TABLE "my_schema"."chat_message_report" ADD CONSTRAINT "chat_message_report_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."chat_message_report" ADD CONSTRAINT "chat_message_report_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_report_message_id_idx" ON "my_schema"."chat_message_report" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "chat_message_report_channel_id_idx" ON "my_schema"."chat_message_report" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "chat_message_report_reported_by_idx" ON "my_schema"."chat_message_report" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "chat_message_report_status_idx" ON "my_schema"."chat_message_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "chat_message_report_created_at_idx" ON "my_schema"."chat_message_report" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_chat_message_report_id_chat_message_report_id_fk" FOREIGN KEY ("chat_message_report_id") REFERENCES "my_schema"."chat_message_report"("id") ON DELETE cascade ON UPDATE no action;