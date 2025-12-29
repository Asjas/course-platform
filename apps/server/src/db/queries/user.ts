import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

/**
 * Get all admin user IDs
 */
export async function getAdminUserIds(): Promise<string[]> {
  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"));

  return admins.map((admin) => admin.id);
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  return db.select().from(user).where(eq(user.role, "admin"));
}

export type AdminUsers = Awaited<ReturnType<typeof getAdminUsers>>;
