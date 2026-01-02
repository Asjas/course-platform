import { relations } from "drizzle-orm";
import { boolean, index, integer, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { user } from "~/db/schema/user.js";

// Types
export type SyncStatus = typeof syncStatus.$inferSelect;
export type NewSyncStatus = typeof syncStatus.$inferInsert;

// Collection names for sync tracking
export const syncCollectionNames = mySchema.enum("sync_collection_names", [
  "announcements",
  "notifications",
  "support-tickets",
  "coupons",
  "reviews",
  "courses",
  "chat-reports",
  "searchable-users",
]);

// Sync states
export const syncStateEnum = mySchema.enum("sync_state", [
  "synced",
  "syncing",
  "offline",
  "error",
]);

/**
 * Stores sync status for each user-collection combination.
 * This allows tracking of offline sync state and last sync timestamps
 * across sessions and devices.
 */
export const syncStatus = mySchema.table(
  "sync_status",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    collectionName: syncCollectionNames().notNull(),
    lastSyncedAt: timestamp({ withTimezone: true }),
    lastEventId: text(),
    syncState: syncStateEnum().default("synced").notNull(),
    pendingUpdates: integer().default(0).notNull(),
    errorMessage: text(),
    isOnline: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("sync_status_user_id_idx").on(table.userId),
    index("sync_status_collection_idx").on(table.collectionName),
    index("sync_status_user_collection_idx").on(
      table.userId,
      table.collectionName,
    ),
  ],
);

// Relations
export const syncStatusRelations = relations(syncStatus, ({ one }) => ({
  user: one(user, {
    fields: [syncStatus.userId],
    references: [user.id],
  }),
}));
