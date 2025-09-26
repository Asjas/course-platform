CREATE TYPE "my_schema"."announcement_id_type" AS ENUM('platform_update', 'platform_warning', 'course_update', 'new_course', 'general', 'warning');--> statement-breakpoint
ALTER TABLE "my_schema"."course_announcement" RENAME TO "platform_announcement";--> statement-breakpoint
ALTER TABLE "my_schema"."course_announcement_read" RENAME TO "platform_announcement_read";--> statement-breakpoint
ALTER TABLE "my_schema"."payment" RENAME COLUMN "payment_status" TO "status";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP CONSTRAINT "course_announcement_pinned_check";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP CONSTRAINT "course_announcement_message_check";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP CONSTRAINT "course_announcement_title_check";--> statement-breakpoint
ALTER TABLE "my_schema"."payment" DROP CONSTRAINT "payment_paid_at_check";--> statement-breakpoint
ALTER TABLE "my_schema"."payment" DROP CONSTRAINT "payment_status_check";--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" DROP CONSTRAINT "coupon_course_id_course_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP CONSTRAINT "course_announcement_course_id_course_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" DROP CONSTRAINT "course_announcement_read_announcement_id_course_announcement_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" DROP CONSTRAINT "course_announcement_read_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "my_schema"."course_announcement_course_idx";--> statement-breakpoint
DROP INDEX "my_schema"."course_announcement_pinned_idx";--> statement-breakpoint
DROP INDEX "my_schema"."course_announcement_read_unique_idx";--> statement-breakpoint
DROP INDEX "my_schema"."course_announcement_read_announcement_idx";--> statement-breakpoint
DROP INDEX "my_schema"."course_announcement_read_user_idx";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD COLUMN "type" "my_schema"."announcement_id_type" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD COLUMN "author_id" text DEFAULT 'ghost';--> statement-breakpoint
ALTER TABLE "my_schema"."invoice" ADD COLUMN "refunded_amount" smallint;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD COLUMN "module_id" text;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" ADD CONSTRAINT "coupon_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD CONSTRAINT "platform_announcement_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" ADD CONSTRAINT "platform_announcement_read_announcement_id_platform_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "my_schema"."platform_announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" ADD CONSTRAINT "platform_announcement_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_module_id_course_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "my_schema"."course_module"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_announcement_author_idx" ON "my_schema"."platform_announcement" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_announcement_read_unique_idx" ON "my_schema"."platform_announcement_read" USING btree ("announcement_id","user_id");--> statement-breakpoint
CREATE INDEX "platform_announcement_read_announcement_idx" ON "my_schema"."platform_announcement_read" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "platform_announcement_read_user_idx" ON "my_schema"."platform_announcement_read" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" DROP COLUMN "pinned";--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD CONSTRAINT "platform_announcement_message_check" CHECK ("my_schema"."platform_announcement"."message" <> '');--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD CONSTRAINT "platform_announcement_title_check" CHECK ("my_schema"."platform_announcement"."title" <> '');--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD CONSTRAINT "platform_announcement_type_check" CHECK ("my_schema"."platform_announcement"."type" IN ('platform_update', 'platform_warning', 'course_update', 'new_course', 'general', 'warning'));--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_paid_at_check" CHECK ("my_schema"."payment"."status" = 'completed' OR "my_schema"."payment"."paid_at" IS NULL);--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_status_check" CHECK ("my_schema"."payment"."status" IN ('pending', 'completed', 'failed', 'refunded'));--> statement-breakpoint
