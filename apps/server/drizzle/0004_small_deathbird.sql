ALTER TABLE "my_schema"."coupon" DROP CONSTRAINT "coupon_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" DROP COLUMN "created_by";