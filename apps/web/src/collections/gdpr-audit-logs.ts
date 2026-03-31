import type { AllGdprAuditLogs } from "@apps/server/src/db/queries/gdprAudit";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type GdprAuditLog = AllGdprAuditLogs[number];

// Default query params for fetching GDPR audit logs
const GDPR_AUDIT_LOGS_QUERY_PARAMS = { limit: 100, offset: 0 } as const;

// Read-only collection for viewing GDPR audit logs as admin
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
