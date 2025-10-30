import { TRPCError } from "@trpc/server";
import * as z from "zod";
import type {
  NewSupportTicket,
  SupportTicket,
} from "~/db/schema/support-tickets.js";
import { publicProcedure, router } from "~/router.js";
import { insertSupportTicket } from "~/routes/support-tickets/mutations.js";

export const supportTicketsRouter = router({
  createSupportTicket: publicProcedure
    .input(
      z.object({
        title: z.string().min(5).max(100),
        description: z.string().max(1000),
        repo: z.url(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
        moduleId: z.string().optional(),
        lessonId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;

      const newSupportTicket: NewSupportTicket = {
        ...input,
        userId: ctx.user?.id,
        assignedToUserId: "user:01K8B1ATHAZW6J8M31Q2E96RF0",
      };

      const [err, newTicket] = await fastify.to(
        insertSupportTicket({ newSupportTicket }),
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
