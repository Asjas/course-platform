import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:mutations:user" });

export type User = typeof user.$inferSelect;

export async function updateUserById({
  userId,
  updates,
}: {
  userId: string;
  updates: User;
}) {
  try {
    const result = await db
      .update(user)
      .set({ ...updates })
      .where(eq(user.id, userId))
      .returning();

    if (result.length === 0) {
      return { user: null };
    }

    return { user: result[0] };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to update user with id ${userId}`);
    }

    throw err;
  }
}

export async function deleteUserById({ userId }: { userId: string }) {
  try {
    const result = db
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    if (!result) {
      return { user: null };
    }

    return { user: result };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to delete user with id ${userId}`);
    }

    throw err;
  }
}
