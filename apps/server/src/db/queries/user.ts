import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

// Module-scoped prepared statements
const preparedGetAdminUserIds = db.query.user
  .findMany({
    where: eq(user.role, "admin"),
    columns: {
      id: true,
    },
  })
  .prepare("getAdminUserIds");

const preparedGetAdminUsers = db.query.user
  .findMany({
    where: eq(user.role, "admin"),
  })
  .prepare("getAdminUsers");

/**
 * Get all admin user IDs
 */
export async function getAdminUserIds(): Promise<string[]> {
  const admins = await preparedGetAdminUserIds.execute();
  return admins.map((admin) => admin.id);
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  return preparedGetAdminUsers.execute();
}

export type AdminUsers = Awaited<ReturnType<typeof getAdminUsers>>;
