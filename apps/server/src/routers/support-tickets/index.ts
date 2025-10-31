import config from "../../config.ts";
import { publicProcedure, router } from "../../router.ts";
import { insertSupportTicket } from "../../routers/support-tickets/mutations.ts";
import type {
  NewSupportTicket,
  SupportTicket,
} from "@packages/db/schema/support-ticket";
import { createSupportTicketSchema } from "@packages/schema/trpc/create-support-ticket.ts";
import { TRPCError } from "@trpc/server";

export const supportTicketsRouter = router({
  createSupportTicket: publicProcedure
    .input(createSupportTicketSchema)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;

      const newSupportTicket: NewSupportTicket = {
        ...input,
        userId: ctx.user?.id,
        assignedToUserId: config.SUPPORT_ASSIGNED_TO_USER_ID,
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
