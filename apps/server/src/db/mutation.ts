import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { redis } from "~/lib/redis.js";

type NewUser = typeof user.$inferInsert;

export async function insertUser(newUser: NewUser) {
  try {
    const [result] = await db
      .insert(user)
      .values(newUser)
      .returning({ id: user.id });

    if (result.id) {
      await redis.del(`user:${result.id}`);
    }

    return result;
  } catch (err) {
    console.error(err, "Failed to insert user");
    throw err;
  }
}
