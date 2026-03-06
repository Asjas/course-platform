CREATE TYPE "my_schema"."signup_source" AS ENUM('learnfastify', 'codewizard', 'other');--> statement-breakpoint
CREATE TABLE "my_schema"."early_signup" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source" "my_schema"."signup_source" DEFAULT 'learnfastify' NOT NULL,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "early_signup_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP INDEX "my_schema"."course_wishlist_email_idx";--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD COLUMN "unsubscribed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "early_signup_email_idx" ON "my_schema"."early_signup" USING btree ("email");--> statement-breakpoint
CREATE INDEX "early_signup_source_idx" ON "my_schema"."early_signup" USING btree ("source");--> statement-breakpoint
CREATE INDEX "early_signup_created_at_idx" ON "my_schema"."early_signup" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "course_wishlist_email_course_idx" ON "my_schema"."course_wishlist" USING btree ("email","course_id");--> statement-breakpoint
CREATE INDEX "course_wishlist_created_at_idx" ON "my_schema"."course_wishlist" USING btree ("created_at");