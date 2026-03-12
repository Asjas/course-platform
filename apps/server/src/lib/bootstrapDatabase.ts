import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "node:path";
import { db, pool } from "~/db/index.js";

interface BootstrapLogger {
  info: (message: string) => void;
}

const migrationsFolder = join(import.meta.dirname, "..", "..", "drizzle");
const databaseSchema = process.env.DATABASE_SCHEMA ?? "my_schema";
const qualifiedUsersTable = `"${databaseSchema}"."user"`;
const qualifiedNotificationPreferencesTable = `"${databaseSchema}"."user_notification_preference"`;
const notificationPreferenceKeyCheck = `
"key" IN (
  'browser:support:ticket_comment',
  'email:support:ticket_comment',
  'browser:support:ticket_closed',
  'email:support:ticket_closed',
  'browser:chat:tagged_message',
  'email:chat:tagged_message',
  'browser:chat:dm_message',
  'email:chat:dm_message',
  'browser:course:course_update',
  'email:course:course_update',
  'browser:course:lesson_update',
  'email:course:lesson_update'
)`;
const ensureNotificationPreferencesSql = `
CREATE TABLE IF NOT EXISTS ${qualifiedNotificationPreferencesTable} (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "key" text NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_notification_preference_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES ${qualifiedUsersTable}("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "user_notif_pref_key_check"
    CHECK (${notificationPreferenceKeyCheck})
);

ALTER TABLE ${qualifiedNotificationPreferencesTable}
  ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

CREATE INDEX IF NOT EXISTS "user_notif_pref_user_idx"
  ON ${qualifiedNotificationPreferencesTable} USING btree ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "user_notif_pref_user_key_idx"
  ON ${qualifiedNotificationPreferencesTable} USING btree ("user_id", "key");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_notification_preference_user_id_user_id_fk'
  ) THEN
    ALTER TABLE ${qualifiedNotificationPreferencesTable}
      ADD CONSTRAINT "user_notification_preference_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES ${qualifiedUsersTable}("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_notif_pref_key_check'
  ) THEN
    ALTER TABLE ${qualifiedNotificationPreferencesTable}
      ADD CONSTRAINT "user_notif_pref_key_check"
      CHECK (${notificationPreferenceKeyCheck});
  END IF;
END $$;
`;
const ensureDefaultUsersSql = `
INSERT INTO ${qualifiedUsersTable} (id, name, username, email, email_verified)
VALUES ('ghost', 'Ghost', 'ghost', 'ghost@codewizard.training', true)
ON CONFLICT (id) DO NOTHING;
`;

export async function bootstrapDatabase(
  logger: BootstrapLogger,
): Promise<void> {
  logger.info("Running database migrations");
  await migrate(db, { migrationsFolder });

  logger.info("Repairing notification preference schema drift");
  await pool.query(ensureNotificationPreferencesSql);

  logger.info("Ensuring default database users exist");
  await pool.query(ensureDefaultUsersSql);

  logger.info("Database bootstrap complete");
}
