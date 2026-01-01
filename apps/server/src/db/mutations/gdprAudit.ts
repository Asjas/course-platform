import { db } from "~/db/index.js";
import { gdprAuditLog, type NewGdprAuditLog } from "~/db/schema/gdprAudit.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:gdpr-audit" });

/**
 * Insert a GDPR audit log entry for compliance tracking
 * Records data export, deletion, and other GDPR-related actions
 */
export async function insertGdprAuditLog(
  auditLog: NewGdprAuditLog,
): Promise<void> {
  try {
    await db.insert(gdprAuditLog).values(auditLog);
  } catch (err) {
    log.error(err, "Failed to insert GDPR audit log");
    // Don't throw - audit logging failures should not break the main operation
  }
}
