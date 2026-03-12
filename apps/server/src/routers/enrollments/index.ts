import {
  type AllEnrollmentsAsAdmin,
  getAllEnrollmentsAsAdmin,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import { isAdmin, publicProcedure, router } from "~/router.js";

export const enrollmentsRouter = router({
  getAll: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllEnrollmentsAsAdmin> => {
      const fastify = ctx.reply.server;

      const [err, enrollments] = await fastify.to(getAllEnrollmentsAsAdmin());

      if (err) {
        fastify.log.error(err, "Failed to fetch all enrollments");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return enrollments;
    }),
});
