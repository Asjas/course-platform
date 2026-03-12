import { sql } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import type { NotificationPreferenceKey } from "~/db/schema/userNotificationPreferences.js";
import { userNotificationPreference } from "~/db/schema/userNotificationPreferences.js";

/**
 * Upsert a single notification preference for a user.
 * Creates the row if it doesn't exist, updates `enabled` if it does.
 */
export async function upsertNotificationPreference({
  userId,
  key,
  enabled,
}: {
  userId: string;
  key: NotificationPreferenceKey;
  enabled: boolean;
}) {
  const [result] = await db
    .insert(userNotificationPreference)
    .values({
      id: `notifpref:${ulid()}`,
      userId,
      key,
      enabled,
    })
    .onConflictDoUpdate({
      target: [
        userNotificationPreference.userId,
        userNotificationPreference.key,
      ],
      set: {
        enabled: sql`excluded.enabled`,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return result;
}

/**
 * Upsert multiple notification preferences in a single transaction.
 * Useful for bulk-saving the entire preferences form in one go.
 */
export async function upsertManyNotificationPreferences({
  userId,
  preferences,
}: {
  userId: string;
  preferences: { key: NotificationPreferenceKey; enabled: boolean }[];
}) {
  if (preferences.length === 0) return [];

  const rows = preferences.map(({ key, enabled }) => ({
    id: `notifpref:${ulid()}`,
    userId,
    key,
    enabled,
  }));

  return db
    .insert(userNotificationPreference)
    .values(rows)
    .onConflictDoUpdate({
      target: [
        userNotificationPreference.userId,
        userNotificationPreference.key,
      ],
      set: {
        enabled: sql`excluded.enabled`,
        updatedAt: sql`now()`,
      },
    })
    .returning();
}
