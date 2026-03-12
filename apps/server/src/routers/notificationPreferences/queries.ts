import { and, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import type { NotificationPreferenceKey } from "~/db/schema/userNotificationPreferences.js";
import { userNotificationPreference } from "~/db/schema/userNotificationPreferences.js";

// ─── prepared statements (module-scoped) ────────────────────────────────────

const preparedGetForUser = db
  .select()
  .from(userNotificationPreference)
  .where(eq(userNotificationPreference.userId, sql.placeholder("userId")))
  .prepare("getNotificationPreferencesForUser");

const preparedGetByKey = db
  .select()
  .from(userNotificationPreference)
  .where(
    and(
      eq(userNotificationPreference.userId, sql.placeholder("userId")),
      eq(userNotificationPreference.key, sql.placeholder("key")),
    ),
  )
  .prepare("getNotificationPreferenceByKey");

export type UserNotificationPreferenceRow =
  (typeof userNotificationPreference)["$inferSelect"];
export type AllNotificationPreferences = UserNotificationPreferenceRow[];

/**
 * Returns all notification preferences stored for a user.
 * Missing rows mean the preference is disabled (default off / opt-in model).
 */
export async function getNotificationPreferencesForUser(
  userId: string,
): Promise<AllNotificationPreferences> {
  return preparedGetForUser.execute({ userId });
}

/**
 * Check whether a specific notification preference is enabled for a user.
 * Returns false if the row doesn't exist (default off).
 */
export async function isNotificationPreferenceEnabled(
  userId: string,
  key: NotificationPreferenceKey,
): Promise<boolean> {
  const [row] = await preparedGetByKey.execute({ userId, key });
  return row?.enabled ?? false;
}
