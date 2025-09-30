import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:user" });

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export async function insertUser(newUser: NewUser) {
  try {
    const result = await db.insert(user).values(newUser).returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to insert user with id ${newUser.id}`);

    throw err;
  }
}

export async function updateUserById(userId: string, updates: Partial<User>) {
  try {
    const result = await db
      .update(user)
      .set({ ...updates })
      .where(eq(user.id, userId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update user with id ${userId}`);
    throw err;
  }
}

export async function deleteUserById(userId: string) {
  try {
    const result = db
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete user with id ${userId}`);
    throw err;
  }
}
