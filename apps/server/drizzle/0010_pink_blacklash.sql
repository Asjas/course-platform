CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TABLE "chat_message_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"reason" text NOT NULL,
	"message_content" text NOT NULL,
	"message_author" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text
);
--> statement-breakpoint
ALTER TABLE "chat_message_reports" ADD CONSTRAINT "chat_message_reports_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reports" ADD CONSTRAINT "chat_message_reports_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;