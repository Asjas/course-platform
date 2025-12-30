import { eq, or } from "drizzle-orm";
import * as z from "zod";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export const usersRouter = router({
  /**
   * Get a user's public profile by their name or username
   * This returns only public profile information suitable for display
   */
  getUserProfile: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input }) => {
      const result = await db.query.user.findFirst({
        where: or(eq(user.name, input.name), eq(user.username, input.name)),
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
          role: true,
          createdAt: true,
        },
      });

      return result ?? null;
    }),
});
