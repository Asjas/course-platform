/**
 * GDPR Audit Logs Collection
 *
 * Offline-first collection for GDPR audit logs (admin only).
 * Read-only collection for compliance tracking.
 */
import type { AllGdprAuditLogs } from "@apps/server/src/db/queries/gdprAudit";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type GdprAuditLog = AllGdprAuditLogs[number];

// Default query params for fetching GDPR audit logs
const GDPR_AUDIT_LOGS_QUERY_PARAMS = { limit: 100, offset: 0 } as const;

/**
 * GDPR audit logs collection for compliance tracking.
 * Read-only - logs are created automatically by the system.
 */
export const GdprAuditLogsCollection = createCollection(
  queryCollectionOptions<GdprAuditLog>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.audit.getGdprAuditLogs.queryKey(
      GDPR_AUDIT_LOGS_QUERY_PARAMS,
    ),
    queryFn: () =>
      trpcClient.audit.getGdprAuditLogs.query(GDPR_AUDIT_LOGS_QUERY_PARAMS),
  }),
);
