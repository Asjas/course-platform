import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { publicProcedure, router } from "~/router.js";
import { insertSupportTicket } from "~/routes/support-tickets/mutations.js";

export const supportTicketsRouter = router({
  createSupportTicket: publicProcedure
    .input(
      z.object({
        title: z.string().min(5).max(100),
        description: z.string().min(10).max(1000),
        repo: z.url().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
        attachments: z.array(z.string()).max(5),
        moduleId: z.string().optional(),
        lessonId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [err, newTicket] = await fastify.to(
        insertSupportTicket({ newSupportTicket: input }),
      );

      if (err) {
        ctx.request.log.error(err, "Failed to create support ticket");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return newTicket;
    }),
});
