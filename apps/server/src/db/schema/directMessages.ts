import { relations } from "drizzle-orm";
import { boolean, index, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { user } from "~/db/schema/user.js";

export type DirectMessageRequest = typeof directMessageRequest.$inferSelect;
export type NewDirectMessageRequest = typeof directMessageRequest.$inferInsert;
export type DirectMessageConversation =
  typeof directMessageConversation.$inferSelect;
export type NewDirectMessageConversation =
  typeof directMessageConversation.$inferInsert;

// Direct message request status
export const dmRequestStatus = mySchema.enum("dm_request_status", [
  "pending",
  "approved",
  "denied",
]);

// Direct message requests table
export const directMessageRequest = mySchema.table(
  "direct_message_request",
  {
    id: text().primaryKey(),
    requesterId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipientId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    message: text().notNull(),
    status: dmRequestStatus().default("pending").notNull(),
    respondedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("dm_request_requester_idx").on(table.requesterId),
    index("dm_request_recipient_idx").on(table.recipientId),
    index("dm_request_status_idx").on(table.status),
  ],
);

// Direct message conversations table
export const directMessageConversation = mySchema.table(
  "direct_message_conversation",
  {
    id: text().primaryKey(),
    user1Id: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    user2Id: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Track which users have "closed" the conversation from their sidebar
    user1Closed: boolean().default(false).notNull(),
    user2Closed: boolean().default(false).notNull(),
    requestId: text().references(() => directMessageRequest.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("dm_conversation_user1_idx").on(table.user1Id),
    index("dm_conversation_user2_idx").on(table.user2Id),
  ],
);

// Relations
export const directMessageRequestRelations = relations(
  directMessageRequest,
  ({ one }) => ({
    requester: one(user, {
      fields: [directMessageRequest.requesterId],
      references: [user.id],
      relationName: "dm_request_requester",
    }),
    recipient: one(user, {
      fields: [directMessageRequest.recipientId],
      references: [user.id],
      relationName: "dm_request_recipient",
    }),
  }),
);

export const directMessageConversationRelations = relations(
  directMessageConversation,
  ({ one }) => ({
    user1: one(user, {
      fields: [directMessageConversation.user1Id],
      references: [user.id],
      relationName: "dm_conversation_user1",
    }),
    user2: one(user, {
      fields: [directMessageConversation.user2Id],
      references: [user.id],
      relationName: "dm_conversation_user2",
    }),
    request: one(directMessageRequest, {
      fields: [directMessageConversation.requestId],
      references: [directMessageRequest.id],
      relationName: "dm_conversation_request",
    }),
  }),
);
