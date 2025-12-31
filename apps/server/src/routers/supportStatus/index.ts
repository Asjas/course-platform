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
  return (status as SupportStatus) || "offline";
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
  getSupportTeam: publicProcedure
    .use(isAuthenticated)
    .query(
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

        const supportTeam = await Promise.all(
          admins.map(async (admin) => {
            const status = await getSupportStatusFromRedis(admin.id);
            return {
              id: admin.id,
              name: admin.name,
              username: admin.username,
              image: admin.image,
              status,
            };
          }),
        );

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
