CREATE TABLE "my_schema"."user_notification_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "user_notif_pref_user_idx" ON "my_schema"."user_notification_preference" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_notif_pref_user_key_idx" ON "my_schema"."user_notification_preference" USING btree ("user_id","key");
