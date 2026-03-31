import { useLiveQuery } from "@tanstack/react-db";
import { GdprAuditLogsCollection } from "~/collections/gdpr-audit-logs";

export function useGdprAuditLogs() {
  return useLiveQuery(GdprAuditLogsCollection);
}
