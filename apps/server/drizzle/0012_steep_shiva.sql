CREATE TYPE "my_schema"."report_status" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_chat_message_reported';--> statement-breakpoint
CREATE TABLE "my_schema"."chat_message_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"reason" text NOT NULL,
	"message_content" text NOT NULL,
	"message_author" text NOT NULL,
	"status" "my_schema"."report_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text
);
--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD COLUMN "chat_message_report_id" text;--> statement-breakpoint
ALTER TABLE "my_schema"."chat_message_reports" ADD CONSTRAINT "chat_message_reports_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."chat_message_reports" ADD CONSTRAINT "chat_message_reports_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_chat_message_report_id_chat_message_reports_id_fk" FOREIGN KEY ("chat_message_report_id") REFERENCES "my_schema"."chat_message_reports"("id") ON DELETE cascade ON UPDATE no action;