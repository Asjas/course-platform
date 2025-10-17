import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

export type User = typeof user.$inferSelect;

export async function updateUserById({
  userId,
  updates,
}: {
  userId: string;
  updates: User;
}) {
  const [updatedUser] = await db
    .update(user)
    .set({ ...updates })
    .where(eq(user.id, userId))
    .returning();

  return updatedUser;
}

export async function deleteUserById({ userId }: { userId: string }) {
  const deletedUser = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();

  return deletedUser;
}
