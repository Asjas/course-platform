import { user } from "./user.js";
import { relations } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";

export const reportStatusEnum = mySchema.enum("report_status", [
  "pending",
  "reviewed",
  "dismissed",
]);

export const chatMessageReport = mySchema.table("chat_message_reports", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  channelId: text("channel_id").notNull(),
  reportedBy: text("reported_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  messageContent: text("message_content").notNull(), // Store message content for context
  messageAuthor: text("message_author").notNull(), // Store author name for reference
  status: reportStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  reviewedBy: text("reviewed_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const chatMessageReportRelations = relations(
  chatMessageReport,
  ({ one }) => ({
    reporter: one(user, {
      fields: [chatMessageReport.reportedBy],
      references: [user.id],
      relationName: "reporter",
    }),
    reviewer: one(user, {
      fields: [chatMessageReport.reviewedBy],
      references: [user.id],
      relationName: "reviewer",
    }),
  }),
);

export type ChatMessageReport = typeof chatMessageReport.$inferSelect;
export type NewChatMessageReport = typeof chatMessageReport.$inferInsert;
