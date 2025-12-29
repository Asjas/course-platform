import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

// Prepared statements (module-scoped)
const preparedGetAdminUserIds = db
  .select({ id: user.id })
  .from(user)
  .where(eq(user.role, "admin"))
  .prepare("getAdminUserIds");

const preparedGetAdminUsers = db
  .select()
  .from(user)
  .where(eq(user.role, "admin"))
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
