DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'report_reason' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'my_schema')
  ) THEN
    CREATE TYPE "my_schema"."report_reason" AS ENUM('spam', 'harassment', 'inappropriate', 'offensive', 'violence', 'illegal', 'other');
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'report_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'my_schema')
  ) THEN
    CREATE TYPE "my_schema"."report_status" AS ENUM('pending', 'reviewed', 'dismissed', 'actioned');
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_chat_message_reported' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_chat_message_reported';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'my_schema' 
    AND table_name = 'chat_message_report'
  ) THEN
    CREATE TABLE "my_schema"."chat_message_report" (
      "id" text PRIMARY KEY NOT NULL,
      "message_id" text NOT NULL,
      "channel_id" text NOT NULL,
      "reported_by" text NOT NULL,
      "reason" "my_schema"."report_reason" NOT NULL,
      "details" text,
      "message_content" text NOT NULL,
      "message_author" text NOT NULL,
      "status" "my_schema"."report_status" DEFAULT 'pending' NOT NULL,
      "reviewed_by" text,
      "reviewed_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "chat_message_report_message_id_check" CHECK ("my_schema"."chat_message_report"."message_id" <> ''),
      CONSTRAINT "chat_message_report_channel_id_check" CHECK ("my_schema"."chat_message_report"."channel_id" <> ''),
      CONSTRAINT "chat_message_report_message_content_check" CHECK ("my_schema"."chat_message_report"."message_content" <> ''),
      CONSTRAINT "chat_message_report_message_author_check" CHECK ("my_schema"."chat_message_report"."message_author" <> ''),
      CONSTRAINT "chat_message_report_reviewed_check" CHECK (("my_schema"."chat_message_report"."status" IN ('reviewed', 'dismissed', 'actioned') AND "my_schema"."chat_message_report"."reviewed_at" IS NOT NULL AND "my_schema"."chat_message_report"."reviewed_by" IS NOT NULL) OR ("my_schema"."chat_message_report"."status" = 'pending' AND "my_schema"."chat_message_report"."reviewed_at" IS NULL AND "my_schema"."chat_message_report"."reviewed_by" IS NULL))
    );
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'my_schema' 
    AND table_name = 'user_notification' 
    AND column_name = 'chat_message_report_id'
  ) THEN
    ALTER TABLE "my_schema"."user_notification" ADD COLUMN "chat_message_report_id" text;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'my_schema' 
    AND table_name = 'chat_message_report' 
    AND constraint_name = 'chat_message_report_reported_by_user_id_fk'
  ) THEN
    ALTER TABLE "my_schema"."chat_message_report" ADD CONSTRAINT "chat_message_report_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'my_schema' 
    AND table_name = 'chat_message_report' 
    AND constraint_name = 'chat_message_report_reviewed_by_user_id_fk'
  ) THEN
    ALTER TABLE "my_schema"."chat_message_report" ADD CONSTRAINT "chat_message_report_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'my_schema' AND tablename = 'chat_message_report' AND indexname = 'chat_message_report_message_id_idx'
  ) THEN
    CREATE INDEX "chat_message_report_message_id_idx" ON "my_schema"."chat_message_report" USING btree ("message_id");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'my_schema' AND tablename = 'chat_message_report' AND indexname = 'chat_message_report_channel_id_idx'
  ) THEN
    CREATE INDEX "chat_message_report_channel_id_idx" ON "my_schema"."chat_message_report" USING btree ("channel_id");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'my_schema' AND tablename = 'chat_message_report' AND indexname = 'chat_message_report_reported_by_idx'
  ) THEN
    CREATE INDEX "chat_message_report_reported_by_idx" ON "my_schema"."chat_message_report" USING btree ("reported_by");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'my_schema' AND tablename = 'chat_message_report' AND indexname = 'chat_message_report_status_idx'
  ) THEN
    CREATE INDEX "chat_message_report_status_idx" ON "my_schema"."chat_message_report" USING btree ("status");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'my_schema' AND tablename = 'chat_message_report' AND indexname = 'chat_message_report_created_at_idx'
  ) THEN
    CREATE INDEX "chat_message_report_created_at_idx" ON "my_schema"."chat_message_report" USING btree ("created_at");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'my_schema' 
    AND table_name = 'user_notification' 
    AND constraint_name = 'user_notification_chat_message_report_id_chat_message_report_id_fk'
  ) THEN
    ALTER TABLE "my_schema"."user_notification" ADD CONSTRAINT "user_notification_chat_message_report_id_chat_message_report_id_fk" FOREIGN KEY ("chat_message_report_id") REFERENCES "my_schema"."chat_message_report"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;