ALTER TABLE "my_schema"."coupon_redemption" RENAME COLUMN "user_id" TO "payment_id";--> statement-breakpoint
ALTER TABLE "my_schema"."coupon_redemption" DROP CONSTRAINT "coupon_redemption_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."payment" DROP CONSTRAINT "payment_coupon_id_coupon_id_fk";
--> statement-breakpoint
DROP INDEX "my_schema"."payment_coupon_idx";--> statement-breakpoint
DROP INDEX "my_schema"."coupon_redemption_unique_idx";--> statement-breakpoint
ALTER TABLE "my_schema"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "my_schema"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemption_unique_idx" ON "my_schema"."coupon_redemption" USING btree ("coupon_id","payment_id","course_id");--> statement-breakpoint
ALTER TABLE "my_schema"."payment" DROP COLUMN "coupon_id";