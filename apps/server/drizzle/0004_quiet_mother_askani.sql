ALTER TABLE "my_schema"."coupon" DROP CONSTRAINT "coupon_current_redemptions_check";--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" DROP CONSTRAINT "coupon_redemptions_limit_check";--> statement-breakpoint
DROP INDEX "my_schema"."coupon_course_idx";--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" ALTER COLUMN "redemption_limit" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" ALTER COLUMN "redemption_limit" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "my_schema"."user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_comment" ADD COLUMN "attachments" text[];--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" DROP COLUMN "current_redemptions";