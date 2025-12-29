ALTER TABLE "my_schema"."course_review" DROP CONSTRAINT "course_review_rating_check";--> statement-breakpoint
ALTER TABLE "my_schema"."course_review" ALTER COLUMN "rating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."course_review" ADD COLUMN "external_link" text;--> statement-breakpoint
ALTER TABLE "my_schema"."course_review" ADD CONSTRAINT "course_review_rating_check" CHECK ("my_schema"."course_review"."rating" IS NULL OR ("my_schema"."course_review"."rating" >= 1 AND "my_schema"."course_review"."rating" <= 5));