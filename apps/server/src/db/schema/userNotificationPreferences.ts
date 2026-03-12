import { sql } from "drizzle-orm";
import { boolean, check, index, text, uniqueIndex } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { user } from "~/db/schema/user.js";

export type UserNotificationPreference =
  typeof userNotificationPreference.$inferSelect;
export type NewUserNotificationPreference =
  typeof userNotificationPreference.$inferInsert;

/**
 * Notification preference keys follow the format:
 *   {channel}:{category}:{type}
 *
 * channel   : "browser" | "email"
 * category  : "support" | "chat" | "course"
 * type      : specific event within the category
 *
 * Examples:
 *   browser:support:ticket_comment
 *   email:support:ticket_closed
 *   browser:chat:tagged_message
 *   email:chat:dm_message
 *   browser:course:course_update
 *   email:course:lesson_update
 */
export const NOTIFICATION_PREFERENCE_KEYS = [
  // Support notifications
  "browser:support:ticket_comment",
  "email:support:ticket_comment",
  "browser:support:ticket_closed",
  "email:support:ticket_closed",
  // Chat notifications
  "browser:chat:tagged_message",
  "email:chat:tagged_message",
  "browser:chat:dm_message",
  "email:chat:dm_message",
  // Course notifications
  "browser:course:course_update",
  "email:course:course_update",
  "browser:course:lesson_update",
  "email:course:lesson_update",
] as const;

export type NotificationPreferenceKey =
  (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

/**
 * Stores a user's opt-in/out choices for each notification channel + type.
 * A missing row defaults to "disabled" (notifications are opt-in).
 */
export const userNotificationPreference = mySchema.table(
  "user_notification_preference",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Key in format "{channel}:{category}:{type}" */
    key: text().notNull(),
    enabled: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("user_notif_pref_user_idx").on(table.userId),
    uniqueIndex("user_notif_pref_user_key_idx").on(table.userId, table.key),
    check(
      "user_notif_pref_key_check",
      sql`${table.key} IN ('browser:support:ticket_comment', 'email:support:ticket_comment', 'browser:support:ticket_closed', 'email:support:ticket_closed', 'browser:chat:tagged_message', 'email:chat:tagged_message', 'browser:chat:dm_message', 'email:chat:dm_message', 'browser:course:course_update', 'email:course:course_update', 'browser:course:lesson_update', 'email:course:lesson_update')`,
    ),
  ],
);
