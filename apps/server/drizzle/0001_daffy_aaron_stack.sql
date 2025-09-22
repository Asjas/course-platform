ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "username" DROP NOT NULL;