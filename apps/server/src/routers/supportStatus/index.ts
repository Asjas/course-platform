import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";
import {
  type MyStatus,
  type SupportTeam,
  getMyStatus,
  getSupportTeam,
  setSupportStatusInRedis,
} from "~/routers/supportStatus/queries.js";

export const supportStatusRouter = router({
  /**
   * Get support team info (admin users with their online/offline status)
   * This is a public endpoint so anyone can see the support team
   */
  getSupportTeam: publicProcedure
    .use(isAuthenticated)
    .query(async (): Promise<SupportTeam> => {
      try {
        return await getSupportTeam();
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch support team status",
        });
      }
    }),

  /**
   * Set the current user's support status (admin only)
   */
  setStatus: publicProcedure
    .use(isAdmin)
    .input(
      z.object({
        status: z.enum(["online", "offline"]),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        await setSupportStatusInRedis(ctx.user.id, input.status);
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update support status",
        });
      }
    }),

  /**
   * Get the current user's support status (admin only)
   */
  getMyStatus: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<MyStatus> => {
      try {
        return await getMyStatus(ctx.user.id);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch support status",
        });
      }
    }),
});
