import { relations, sql } from "drizzle-orm";
import { check, index, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { supportTicket } from "~/db/schema/support-tickets.js";
import { user } from "~/db/schema/user.js";

export type UserNotification = typeof userNotification.$inferSelect;
export type NewUserNotification = typeof userNotification.$inferInsert;

// Notification types
export const userNotificationType = mySchema.enum("user_notification_type", [
  "support_ticket_comment",
  "support_ticket_status_change",
  "course_enrollment",
  "review_approved",
  "general",
]);

// User notifications table
export const userNotification = mySchema.table(
  "user_notification",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: userNotificationType().default("general").notNull(),
    title: text().notNull(),
    message: text().notNull(),
    link: text(),
    // Reference to related entities (optional)
    supportTicketId: text().references(() => supportTicket.id, {
      onDelete: "cascade",
    }),
    // Who triggered this notification (optional)
    actorId: text().references(() => user.id, { onDelete: "set null" }),
    readAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("user_notification_user_idx").on(table.userId),
    index("user_notification_read_at_idx").on(table.readAt),
    index("user_notification_created_at_idx").on(table.createdAt),
    check("user_notification_message_check", sql`${table.message} <> ''`),
    check("user_notification_title_check", sql`${table.title} <> ''`),
  ],
);

// Relations
export const userNotificationRelations = relations(
  userNotification,
  ({ one }) => ({
    user: one(user, {
      fields: [userNotification.userId],
      references: [user.id],
      relationName: "user_notification_user",
    }),
    actor: one(user, {
      fields: [userNotification.actorId],
      references: [user.id],
      relationName: "user_notification_actor",
    }),
    supportTicket: one(supportTicket, {
      fields: [userNotification.supportTicketId],
      references: [supportTicket.id],
      relationName: "user_notification_support_ticket",
    }),
  }),
);
