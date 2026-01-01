import { db } from "~/db/index.js";

/**
 * Get all GDPR audit logs with pagination
 * For admin audit trail viewing
 */
export async function getAllGdprAuditLogs(limit = 100, offset = 0) {
  const logs = await db.query.gdprAuditLog.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
    offset,
  });

  return logs;
}

// Type exports
export type AllGdprAuditLogs = Awaited<ReturnType<typeof getAllGdprAuditLogs>>;
export type GdprAuditLog = AllGdprAuditLogs[number];
