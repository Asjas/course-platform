import { getAdminUsers } from "~/db/queries/user.js";
import { redis } from "~/lib/redis.js";

const SUPPORT_STATUS_KEY = "support:status";

export type SupportStatus = "online" | "offline";

// Type exports for support status queries
export type SupportTeam = Awaited<ReturnType<typeof getSupportTeam>>;
export type MyStatus = Awaited<ReturnType<typeof getMyStatus>>;

/**
 * Get the support team status from Redis for a single user
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
export async function setSupportStatusInRedis(
  userId: string,
  status: SupportStatus,
): Promise<void> {
  await redis.hset(SUPPORT_STATUS_KEY, userId, status);
}

/**
 * Get support team info (admin users with their online/offline status)
 */
export async function getSupportTeam() {
  const admins = await getAdminUsers();
  const adminIds = admins.map((admin) => admin.id);

  if (adminIds.length === 0) {
    return [];
  }

  const statuses = await redis.hmget(SUPPORT_STATUS_KEY, ...adminIds);

  const supportTeam = admins.map((admin, index) => {
    const rawStatus = statuses[index];
    const normalizedStatus: SupportStatus =
      rawStatus === "online" || rawStatus === "offline" ? rawStatus : "offline";

    return {
      id: admin.id,
      name: admin.name,
      username: admin.username,
      image: admin.image,
      status: normalizedStatus,
    };
  });

  return supportTeam;
}

/**
 * Get current user's support status
 */
export async function getMyStatus(userId: string) {
  const status = await getSupportStatusFromRedis(userId);
  return { status };
}
