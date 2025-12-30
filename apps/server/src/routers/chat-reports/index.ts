import { createReport, deleteReport, updateReportStatus } from "./mutations.js";
import { type AllReports, getAllReports } from "./queries.js";
import * as z from "zod";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";

export const chatReportsRouter = router({
  // Get all reports (admin only)
  getAllReports: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .query(async (): Promise<AllReports> => {
      return getAllReports();
    }),

  // Report a message (authenticated users)
  reportMessage: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        messageId: z.string(),
        channelId: z.string(),
        reason: z.string(),
        messageContent: z.string(),
        messageAuthor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createReport({
        ...input,
        reportedBy: ctx.user.id,
      });
    }),

  // Update report status (admin only)
  updateReportStatus: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(
      z.object({
        reportId: z.string(),
        status: z.enum(["reviewed", "dismissed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateReportStatus({
        reportId: input.reportId,
        status: input.status,
        reviewedBy: ctx.user.id,
      });
    }),

  // Delete report (admin only)
  deleteReport: publicProcedure
    .use(isAuthenticated)
    .use(isAdmin)
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteReport(input.reportId);
      return { success: true };
    }),
});
