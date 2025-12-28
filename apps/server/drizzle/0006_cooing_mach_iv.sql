CREATE TYPE "my_schema"."user_notification_type" AS ENUM('support_ticket_comment', 'support_ticket_status_change', 'course_enrollment', 'general');--> statement-breakpoint
CREATE TABLE "my_schema"."user_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "my_schema"."user_notification_type" DEFAULT 'general' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"support_ticket_id" text,
	"actor_id" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_message_check" CHECK ("my_schema"."user_notification"."message" <> ''),
	CONSTRAINT "user_notification_title_check" CHECK ("my_schema"."user_notification"."title" <> '')
);
--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_support_ticket_id_support_ticket_id_fk" FOREIGN KEY ("support_ticket_id") REFERENCES "my_schema"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_notification_user_idx" ON "my_schema"."user_notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notification_read_at_idx" ON "my_schema"."user_notification" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "user_notification_created_at_idx" ON "my_schema"."user_notification" USING btree ("created_at");