import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

/**
 * Get all admin user IDs
 */
export async function getAdminUserIds(): Promise<string[]> {
  const preparedStatement = db.query.user
    .findMany({
      where: eq(user.role, "admin"),
      columns: {
        id: true,
      },
    })
    .prepare("getAdminUserIds");

  const admins = await preparedStatement.execute();
  return admins.map((admin) => admin.id);
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  const preparedStatement = db.query.user
    .findMany({
      where: eq(user.role, "admin"),
    })
    .prepare("getAdminUsers");

  return preparedStatement.execute();
}

export type AdminUsers = Awaited<ReturnType<typeof getAdminUsers>>;
