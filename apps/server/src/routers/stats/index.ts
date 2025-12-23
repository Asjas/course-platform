import { TRPCError } from "@trpc/server";
import { isAdmin, router } from "~/router.js";

export const statsRouter = router({
  // Get course statistics
  getCourseStats: router.procedure.use(isAdmin).query(async ({ ctx }) => {
    const fastify = ctx.reply.server;

    const [err, stats] = await fastify.to(fastify.cache.getCourseStats());

    if (err) {
      fastify.log.error(err);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch course statistics",
      });
    }

    return stats;
  }),

  // Get platform statistics
  getPlatformStats: router.procedure.use(isAdmin).query(async ({ ctx }) => {
    const fastify = ctx.reply.server;

    const [err, stats] = await fastify.to(fastify.cache.getPlatformStats());

    if (err) {
      fastify.log.error(err);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch platform statistics",
      });
    }

    return stats;
  }),
});
