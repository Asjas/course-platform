CREATE TYPE "my_schema"."dm_request_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'dm_request_received';--> statement-breakpoint
ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'dm_request_approved';--> statement-breakpoint
ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'dm_request_denied';--> statement-breakpoint
CREATE TABLE "my_schema"."direct_message_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"user1_id" text NOT NULL,
	"user2_id" text NOT NULL,
	"user1_closed" boolean DEFAULT false NOT NULL,
	"user2_closed" boolean DEFAULT false NOT NULL,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."direct_message_request" (
	"id" text PRIMARY KEY NOT NULL,
	"requester_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"message" text NOT NULL,
	"status" "my_schema"."dm_request_status" DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD COLUMN "dm_request_id" text;--> statement-breakpoint
ALTER TABLE "my_schema"."direct_message_conversation" ADD CONSTRAINT "direct_message_conversation_user1_id_user_id_fk" FOREIGN KEY ("user1_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."direct_message_conversation" ADD CONSTRAINT "direct_message_conversation_user2_id_user_id_fk" FOREIGN KEY ("user2_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."direct_message_conversation" ADD CONSTRAINT "direct_message_conversation_request_id_direct_message_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "my_schema"."direct_message_request"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."direct_message_request" ADD CONSTRAINT "direct_message_request_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."direct_message_request" ADD CONSTRAINT "direct_message_request_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dm_conversation_user1_idx" ON "my_schema"."direct_message_conversation" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "dm_conversation_user2_idx" ON "my_schema"."direct_message_conversation" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "dm_request_requester_idx" ON "my_schema"."direct_message_request" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "dm_request_recipient_idx" ON "my_schema"."direct_message_request" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "dm_request_status_idx" ON "my_schema"."direct_message_request" USING btree ("status");--> statement-breakpoint
ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_dm_request_id_direct_message_request_id_fk" FOREIGN KEY ("dm_request_id") REFERENCES "my_schema"."direct_message_request"("id") ON DELETE cascade ON UPDATE no action;