import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { session } from "~/db/schema/user.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:session" });

export type Session = typeof session.$inferSelect;

export async function deleteSessionByToken(token: string) {
  try {
    const result = await db
      .delete(session)
      .where(eq(session.token, token))
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to delete session by token");
    throw err;
  }
}

export async function deleteSessionByUserId(userId: string) {
  try {
    const result = await db
      .delete(session)
      .where(eq(session.userId, userId))
      .returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to delete sessions by userId");
    throw err;
  }
}
