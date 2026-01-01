import { relations } from "drizzle-orm";
import { index, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { user } from "~/db/schema/user.js";

export type GdprAuditLog = typeof gdprAuditLog.$inferSelect;
export type NewGdprAuditLog = typeof gdprAuditLog.$inferInsert;

// GDPR action type enum
export const gdprActionType = mySchema.enum("gdpr_action_type", [
  "data_export",
  "data_deletion",
  "data_access",
  "consent_update",
  "data_rectification",
]);

// GDPR export format enum
export const gdprExportFormat = mySchema.enum("gdpr_export_format", [
  "json",
  "csv",
]);

// GDPR audit status enum
export const gdprAuditStatus = mySchema.enum("gdpr_audit_status", [
  "success",
  "failure",
  "partial",
]);

// GDPR audit log table for compliance tracking
export const gdprAuditLog = mySchema.table(
  "gdpr_audit_log",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actionType: gdprActionType().notNull(),
    status: gdprAuditStatus().notNull(),
    exportFormat: gdprExportFormat(),
    ipAddress: varchar({ length: 45 }), // IPv4 (15) or IPv6 (45)
    userAgent: text(),
    errorMessage: text(),
    metadata: text(), // JSON string for additional data
    ...timestamps,
  },
  (table) => [
    index("gdpr_audit_log_user_id_idx").on(table.userId),
    index("gdpr_audit_log_action_type_idx").on(table.actionType),
    index("gdpr_audit_log_status_idx").on(table.status),
    index("gdpr_audit_log_created_at_idx").on(table.createdAt),
  ],
);

// Relations
export const gdprAuditLogRelations = relations(gdprAuditLog, ({ one }) => ({
  user: one(user, {
    fields: [gdprAuditLog.userId],
    references: [user.id],
  }),
}));
