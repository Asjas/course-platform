import { relations, sql } from "drizzle-orm";
import { check, index, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { user } from "~/db/schema/user.js";

export type ChatMessageReport = typeof chatMessageReport.$inferSelect;
export type NewChatMessageReport = typeof chatMessageReport.$inferInsert;

// Report status enum
export const reportStatus = mySchema.enum("report_status", [
  "pending",
  "reviewed",
  "dismissed",
  "actioned",
]);

// Report reason enum
export const reportReason = mySchema.enum("report_reason", [
  "spam",
  "harassment",
  "inappropriate",
  "offensive",
  "violence",
  "illegal",
  "other",
]);

// Chat message reports table
export const chatMessageReport = mySchema.table(
  "chat_message_report",
  {
    id: text().primaryKey(),
    messageId: text().notNull(),
    channelId: text().notNull(),
    reportedBy: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: reportReason().notNull(),
    details: text(),
    messageContent: text().notNull(),
    messageAuthor: text().notNull(),
    status: reportStatus().default("pending").notNull(),
    reviewedBy: text().references(() => user.id, { onDelete: "set null" }),
    reviewedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("chat_message_report_message_id_idx").on(table.messageId),
    index("chat_message_report_channel_id_idx").on(table.channelId),
    index("chat_message_report_reported_by_idx").on(table.reportedBy),
    index("chat_message_report_status_idx").on(table.status),
    index("chat_message_report_created_at_idx").on(table.createdAt),
    check(
      "chat_message_report_message_id_check",
      sql`${table.messageId} <> ''`,
    ),
    check(
      "chat_message_report_channel_id_check",
      sql`${table.channelId} <> ''`,
    ),
    check(
      "chat_message_report_message_content_check",
      sql`${table.messageContent} <> ''`,
    ),
    check(
      "chat_message_report_message_author_check",
      sql`${table.messageAuthor} <> ''`,
    ),
    check(
      "chat_message_report_reviewed_check",
      sql`(${table.status} IN ('reviewed', 'dismissed', 'actioned') AND ${table.reviewedAt} IS NOT NULL AND ${table.reviewedBy} IS NOT NULL) OR (${table.status} = 'pending' AND ${table.reviewedAt} IS NULL AND ${table.reviewedBy} IS NULL)`,
    ),
  ],
);

// Relations
export const chatMessageReportRelations = relations(
  chatMessageReport,
  ({ one }) => ({
    reporter: one(user, {
      fields: [chatMessageReport.reportedBy],
      references: [user.id],
      relationName: "chat_message_report_reporter",
    }),
    reviewer: one(user, {
      fields: [chatMessageReport.reviewedBy],
      references: [user.id],
      relationName: "chat_message_report_reviewer",
    }),
  }),
);
