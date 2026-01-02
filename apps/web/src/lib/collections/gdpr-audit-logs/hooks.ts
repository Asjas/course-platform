/**
 * GDPR Audit Logs Hooks
 *
 * React hooks for accessing the GDPR audit logs collection.
 */
import { GdprAuditLogsCollection } from "./gdpr-audit-logs.collection";
import { useLiveQuery } from "@tanstack/react-db";

/**
 * Get all GDPR audit logs.
 * Uses the offline-first collection.
 */
export function useGdprAuditLogs() {
  return useLiveQuery(GdprAuditLogsCollection);
}
