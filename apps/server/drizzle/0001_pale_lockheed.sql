ALTER TABLE "my_schema"."invitation" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "my_schema"."invitation" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
ALTER TABLE "my_schema"."member" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "my_schema"."member" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
ALTER TABLE "my_schema"."user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "my_schema"."user" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
DROP TYPE "my_schema"."members";--> statement-breakpoint
CREATE TYPE "my_schema"."members" AS ENUM('member', 'admin');--> statement-breakpoint
ALTER TABLE "my_schema"."invitation" ALTER COLUMN "role" SET DEFAULT 'member'::"my_schema"."members";--> statement-breakpoint
ALTER TABLE "my_schema"."invitation" ALTER COLUMN "role" SET DATA TYPE "my_schema"."members" USING "role"::"my_schema"."members";--> statement-breakpoint
ALTER TABLE "my_schema"."member" ALTER COLUMN "role" SET DEFAULT 'member'::"my_schema"."members";--> statement-breakpoint
ALTER TABLE "my_schema"."member" ALTER COLUMN "role" SET DATA TYPE "my_schema"."members" USING "role"::"my_schema"."members";--> statement-breakpoint
ALTER TABLE "my_schema"."user" ALTER COLUMN "role" SET DEFAULT 'member'::"my_schema"."members";--> statement-breakpoint
ALTER TABLE "my_schema"."user" ALTER COLUMN "role" SET DATA TYPE "my_schema"."members" USING "role"::"my_schema"."members";