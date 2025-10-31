import { mySchema } from "../my-schema.ts";
import { timestamps } from "./columns.helpers.ts";
import { user } from "./user.ts";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const announcementIdType = mySchema.enum("announcement_id_type", [
  "platform_update",
  "platform_warning",
  "course_update",
  "new_course",
  "general",
  "warning",
]);

// Tables
export const platformAnnouncement = mySchema.table(
  "platform_announcement",
  {
    id: text().primaryKey(),
    title: text().notNull(),
    message: text().notNull(),
    type: announcementIdType().default("general").notNull(),
    publishedAt: timestamp({ withTimezone: true }),
    authorId: text()
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
    ...timestamps,
  },
  (table) => [
    index("platform_announcement_author_idx").on(table.authorId),
    check("platform_announcement_message_check", sql`${table.message} <> ''`),
    check("platform_announcement_title_check", sql`${table.title} <> ''`),
    check(
      "platform_announcement_type_check",
      sql`${table.type} IN ('platform_update', 'platform_warning', 'course_update', 'new_course', 'general', 'warning')`,
    ),
  ],
);

export const platformAnnouncementRead = mySchema.table(
  "platform_announcement_read",
  {
    id: text().primaryKey(),
    announcementId: text()
      .notNull()
      .references(() => platformAnnouncement.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("platform_announcement_read_unique_idx").on(
      table.announcementId,
      table.userId,
    ),
    index("platform_announcement_read_announcement_idx").on(
      table.announcementId,
    ),
    index("platform_announcement_read_user_idx").on(table.userId),
  ],
);

// Relations
export const platformAnnouncementRelations = relations(
  platformAnnouncement,
  ({ one, many }) => ({
    author: one(user, {
      fields: [platformAnnouncement.authorId],
      references: [user.id],
      relationName: "platform_announcement_author",
    }),
    reads: many(platformAnnouncementRead),
  }),
);

export const platformAnnouncementReadRelations = relations(
  platformAnnouncementRead,
  ({ one }) => ({
    announcement: one(platformAnnouncement, {
      fields: [platformAnnouncementRead.announcementId],
      references: [platformAnnouncement.id],
      relationName: "platform_announcement_read_announcement",
    }),
    user: one(user, {
      fields: [platformAnnouncementRead.userId],
      references: [user.id],
      relationName: "platform_announcement_read_user",
    }),
  }),
);
