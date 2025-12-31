import * as z from "zod";
import { getAdminUsers } from "~/db/queries/user.js";
import { redis } from "~/lib/redis.js";
import { isAdmin, isAuthenticated, publicProcedure, router } from "~/router.js";

const SUPPORT_STATUS_KEY = "support:status";

export type SupportStatus = "online" | "offline";

/**
 * Get the support team status from Redis
 */
async function getSupportStatusFromRedis(
  userId: string,
): Promise<SupportStatus> {
  const status = await redis.hget(SUPPORT_STATUS_KEY, userId);

  if (status === "online" || status === "offline") {
    return status;
  }

  return "offline";
}

/**
 * Set the support team status in Redis
 */
async function setSupportStatusInRedis(
  userId: string,
  status: SupportStatus,
): Promise<void> {
  await redis.hset(SUPPORT_STATUS_KEY, userId, status);
}

export const supportStatusRouter = router({
  /**
   * Get support team info (admin users with their online/offline status)
   * This is a public endpoint so anyone can see the support team
   */
  getSupportTeam: publicProcedure.use(isAuthenticated).query(
    async (): Promise<
      {
        id: string;
        name: string;
        username: string | null;
        image: string | null;
        status: SupportStatus;
      }[]
    > => {
      const admins = await getAdminUsers();
      const adminIds = admins.map((admin) => admin.id);

      if (adminIds.length === 0) {
        return [];
      }

      const statuses = await redis.hmget(SUPPORT_STATUS_KEY, ...adminIds);

      const supportTeam = admins.map((admin, index) => {
        const rawStatus = statuses[index];
        const normalizedStatus: SupportStatus =
          rawStatus === "online" || rawStatus === "offline"
            ? rawStatus
            : "offline";

        return {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          image: admin.image,
          status: normalizedStatus,
        };
      });
      return supportTeam;
    },
  ),

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
      await setSupportStatusInRedis(ctx.user.id, input.status);
      return { success: true };
    }),

  /**
   * Get the current user's support status (admin only)
   */
  getMyStatus: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<{ status: SupportStatus }> => {
      const status = await getSupportStatusFromRedis(ctx.user.id);
      return { status };
    }),
});
