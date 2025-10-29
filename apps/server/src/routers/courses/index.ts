import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { publicProcedure, router } from "~/router.js";

export const coursesRouter = router({
  getModulesAndLessonsByCourseId: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { courseId } = input;
      const fastify = ctx.reply.server;

      const [err, modulesAndLessons] = await fastify.to(
        fastify.cache.getModulesAndLessonsByCourseId({ courseId }),
      );

      if (err) {
        fastify.log.error(err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return modulesAndLessons;
    }),
});
