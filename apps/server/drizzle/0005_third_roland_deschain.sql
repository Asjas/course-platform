ALTER TABLE "my_schema"."user" DROP COLUMN IF EXISTS "image";--> statement-breakpoint
ALTER TABLE "my_schema"."user" ADD COLUMN "image" bytea;--> statement-breakpoint
