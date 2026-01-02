/**
 * GDPR Audit Logs Collection
 *
 * Re-exports collection and hooks for GDPR audit logs.
 */

export {
  GdprAuditLogsCollection,
  type GdprAuditLog,
} from "./gdpr-audit-logs.collection";

export { useGdprAuditLogs } from "./hooks";
