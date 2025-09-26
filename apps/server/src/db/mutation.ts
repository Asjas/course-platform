import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { session, user } from "~/db/schema/user.js";
import { ONE_DAY } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

type User = typeof user.$inferSelect;
type NewUser = typeof user.$inferInsert;
type Session = typeof session.$inferSelect;

export async function insertUser(newUser: NewUser) {
  const preparedStatement = db
    .insert(user)
    .values(newUser)
    .returning()
    .prepare("insertUser");

  try {
    const [result] = await preparedStatement.execute({ newUser });

    if (result.id) {
      await redis.setex(`user:${result.id}`, JSON.stringify(newUser), ONE_DAY);

      return result;
    } else {
      throw new Error("Failed to insert user, no ID returned");
    }
  } catch (err) {
    console.error(err);

    throw err;
  }
}

export async function updateUserById(id: string, updates: Partial<User>) {
  const preparedStatement = db
    .update(user)
    .set(updates)
    .where(eq(user.id, sql.placeholder("id")))
    .returning()
    .prepare("updateUserById");

  try {
    const [result] = await preparedStatement.execute({ id });

    if (result.id) {
      const cached = await redis.get(`user:${result.id}`);

      if (cached) {
        const cachedUser = JSON.parse(cached);
        const updatedUser = { ...cachedUser, ...updates };

        await redis.setex(
          `user:${result.id}`,
          JSON.stringify(updatedUser),
          ONE_DAY,
        );
      }

      return result;
    } else {
      throw new Error("Failed to update user, no ID returned");
    }
  } catch (err) {
    console.error(err, `Failed to update user with id ${id}`);
    throw err;
  }
}

export async function deleteUserById({ id }: User) {
  const preparedStatement = db
    .delete(user)
    .where(eq(user.id, id))
    .returning({ id: user.id })
    .prepare("deleteUserById");

  try {
    const [result] = await preparedStatement.execute({ id });

    if (result.id) {
      await redis.del(`user:${result.id}`);
      await redis.del(`sessions:user:${result.id}`);
    }

    return result;
  } catch (err) {
    console.error(err, `Failed to delete user with id ${id}`);
    throw err;
  }
}

export async function deleteSessionByToken(token: string) {
  try {
    const result = await db
      .delete(session)
      .where(eq(session.token, token))
      .returning({ userId: session.userId })
      .prepare("deleteSessionByToken");
  } catch (err) {
    console.error(err, "Failed to delete session by token");
    throw err;
  }
}

export async function deleteSessionByUserId(userId: string) {
  try {
    const result = await db
      .delete(session)
      .where(eq(session.userId, userId))
      .returning({ userId: session.userId })
      .prepare("deleteSessionsByUserId");

    await redis.del(`sessions:user:${userId}`);
  } catch (err) {
    console.error(err, "Failed to delete sessions by userId");
    throw err;
  }
}
