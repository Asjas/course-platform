import { eq, inArray, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { enrollment } from "~/db/schema/enrollment.js";
import { user } from "~/db/schema/user.js";

// Module-scoped prepared statements for optimal performance
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

const preparedGetUserById = db.query.user
  .findFirst({
    where: eq(user.id, sql.placeholder("id")),
    columns: {
      id: true,
      name: true,
      email: true,
    },
  })
  .prepare("getUserById");

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

/**
 * Get a user by ID (returns id, name, email only)
 */
export async function getUserById(id: string) {
  return preparedGetUserById.execute({ id });
}

export type UserBasic = Awaited<ReturnType<typeof getUserById>>;

/**
 * Get multiple users by their usernames (for @mention lookup).
 * Usernames are matched case-insensitively against the `username` column.
 */
export async function getUsersByUsernames(
  usernames: string[],
): Promise<{ id: string; name: string; email: string }[]> {
  if (usernames.length === 0) return [];
  const lower = usernames.map((u) => u.toLowerCase());
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(sql`lower(${user.username}) = any(${lower})`);
}

/**
 * Get basic info for all users enrolled in a course.
 * Used for dispatching course/lesson update notifications.
 */
export async function getEnrolledUsersByCourseId(
  courseId: string,
): Promise<{ id: string; name: string; email: string }[]> {
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .innerJoin(enrollment, eq(enrollment.userId, user.id))
    .where(eq(enrollment.courseId, courseId));
}
