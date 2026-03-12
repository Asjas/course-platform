import { upsertManyNotificationPreferences } from "./mutations.js";
import {
  type AllNotificationPreferences,
  getNotificationPreferencesForUser,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { NOTIFICATION_PREFERENCE_KEYS } from "~/db/schema/userNotificationPreferences.js";
import { pinoLogger } from "~/lib/logging.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

const log = pinoLogger.child({
  module: "routers:notificationPreferences",
});

const notificationPreferenceKeySchema = z.enum(
  NOTIFICATION_PREFERENCE_KEYS as readonly [string, ...string[]] as [
    string,
    ...string[],
  ],
);

export const notificationPreferencesRouter = router({
  /**
   * Get all notification preferences for a user.
   * Missing rows default to disabled (opt-in model).
   */
  getForUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ input, ctx }): Promise<AllNotificationPreferences> => {
      if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot fetch other users' notification preferences",
        });
      }

      try {
        return await getNotificationPreferencesForUser(input.userId);
      } catch (error) {
        log.error(error, "Failed to fetch notification preferences");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notification preferences",
        });
      }
    }),

  /**
   * Bulk-update all notification preferences for a user.
   * Accepts the full set of key/enabled pairs from the preferences form.
   */
  updateBulk: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        preferences: z.array(
          z.object({
            key: notificationPreferenceKeySchema,
            enabled: z.boolean(),
          }),
        ),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }): Promise<AllNotificationPreferences> => {
      if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot update other users' notification preferences",
        });
      }

      try {
        const result = await upsertManyNotificationPreferences({
          userId: input.userId,
          preferences: input.preferences.map((p) => ({
            key: p.key as (typeof NOTIFICATION_PREFERENCE_KEYS)[number],
            enabled: p.enabled,
          })),
        });

        return result;
      } catch (error) {
        log.error(error, "Failed to update notification preferences");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification preferences",
        });
      }
    }),
});
