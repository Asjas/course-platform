import * as z from "zod";
import {
  type AllGdprAuditLogs,
  getAllGdprAuditLogs,
} from "~/db/queries/gdprAudit.js";
import { isAdmin, publicProcedure, router } from "~/router.js";

export const auditRouter = router({
  getGdprAuditLogs: publicProcedure
    .use(isAdmin)
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(100),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ input }): Promise<AllGdprAuditLogs> => {
      return getAllGdprAuditLogs(input.limit, input.offset);
    }),
});
