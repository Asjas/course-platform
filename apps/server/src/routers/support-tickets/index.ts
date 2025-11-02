import type {
  NewSupportTicket,
  SupportTicket,
} from "@packages/db/schema/support-ticket";
import { createSupportTicketSchema } from "@packages/schema/trpc/create-support-ticket.ts";
import { TRPCError } from "@trpc/server";
import config from "~/config.js";
import { publicProcedure, router } from "~/router.js";
import { insertSupportTicket } from "~/routers/support-tickets/mutations.js";

export const supportTicketsRouter = router({
  createSupportTicket: publicProcedure
    .input(createSupportTicketSchema)
    .mutation(async ({ ctx, input }): Promise<SupportTicket> => {
      const fastify = ctx.reply.server;

      const newSupportTicket: NewSupportTicket = {
        ...input,
        userId: ctx.user?.id,
        assignedToUserId: config["SUPPORT_ASSIGNED_TO_USER_ID"],
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

      if (!newTicket) {
        ctx.request.log.debug("Support ticket creation returned no result");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Support ticket creation failed",
        });
      }

      ctx.request.log.debug(
        `Inserted support ticket with id ${newTicket.id} successfully`,
      );

      return newTicket;
    }),
});
