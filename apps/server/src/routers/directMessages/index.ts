import {
  approveDMRequest,
  closeConversation,
  createDMApprovedNotification,
  createDMDeniedNotification,
  createDMRequest,
  createDMRequestNotification,
  denyDMRequest,
  reopenConversation,
} from "./mutations.js";
import {
  type ActiveConversations,
  type ConversationById,
  type DMRequestById,
  type PendingDMRequests,
  type SearchedUsers,
  findConversationBetweenUsers,
  findDMRequestBetweenUsers,
  getActiveConversationsForUser,
  getConversationById,
  getDMRequestById,
  getPendingDMRequests,
  searchUsersByUsername,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { pinoLogger } from "~/lib/logging.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

const log = pinoLogger.child({ module: "routers:directMessages" });

export const directMessagesRouter = router({
  /**
   * Search users by username
   */
  searchUsers: publicProcedure
    .input(z.object({ searchTerm: z.string().min(1) }))
    .use(isAuthenticated)
    .query(async ({ input }): Promise<SearchedUsers> => {
      try {
        return await searchUsersByUsername(input.searchTerm);
      } catch (error) {
        log.error(error, "Failed to search users");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search users",
        });
      }
    }),

  /**
   * Get pending DM requests for the current user
   */
  getPendingRequests: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }): Promise<PendingDMRequests> => {
      try {
        return await getPendingDMRequests(ctx.user.id);
      } catch (error) {
        log.error(error, "Failed to fetch pending DM requests");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pending DM requests",
        });
      }
    }),

  /**
   * Get a DM request by ID
   */
  getDMRequest: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ input }): Promise<NonNullable<DMRequestById>> => {
      try {
        const request = await getDMRequestById(input.requestId);

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "DM request not found",
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to fetch DM request");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch DM request",
        });
      }
    }),

  /**
   * Get active conversations for the current user
   */
  getActiveConversations: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }): Promise<ActiveConversations> => {
      try {
        return await getActiveConversationsForUser(ctx.user.id);
      } catch (error) {
        log.error(error, "Failed to fetch active conversations");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch active conversations",
        });
      }
    }),

  /**
   * Get a conversation by ID
   */
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ input, ctx }): Promise<NonNullable<ConversationById>> => {
      try {
        const conversation = await getConversationById(input.conversationId);

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        // Verify user is part of this conversation
        if (
          conversation.user1Id !== ctx.user.id &&
          conversation.user2Id !== ctx.user.id
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not part of this conversation",
          });
        }

        return conversation;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to fetch conversation");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch conversation",
        });
      }
    }),

  /**
   * Request a DM with another user
   */
  requestDM: publicProcedure
    .input(
      z.object({
        recipientId: z.string(),
        message: z.string().min(1),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }) => {
      try {
        const { recipientId, message } = input;
        const requesterId = ctx.user.id;

        // Prevent requesting DM with yourself
        if (requesterId === recipientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot request DM with yourself",
          });
        }

        // Check if conversation already exists
        const existingConversation = await findConversationBetweenUsers(
          requesterId,
          recipientId,
        );
        if (existingConversation) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Conversation already exists",
          });
        }

        // Check if there's already a pending/approved request
        const existingRequest = await findDMRequestBetweenUsers(
          requesterId,
          recipientId,
        );
        if (existingRequest) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "DM request already sent",
          });
        }

        // Get recipient to check if they're an admin
        const recipient = await getDMRequestById(recipientId);
        const autoApprove = recipient?.recipient?.role === "admin";

        // Create the request
        const result = await createDMRequest({
          requesterId,
          recipientId,
          message,
          autoApprove,
        });

        // Create notification for recipient (unless auto-approved)
        if (!autoApprove) {
          await createDMRequestNotification({
            requestId: result.requestId,
            requesterId,
            recipientId,
            requesterName: ctx.user.name,
          });
        } else if (result.conversationId) {
          // If auto-approved, notify the requester
          await createDMApprovedNotification({
            requesterId,
            recipientId,
            recipientName: recipient?.recipient?.name || "Admin",
            conversationId: result.conversationId,
          });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to create DM request");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create DM request",
        });
      }
    }),

  /**
   * Approve a DM request
   */
  approveDMRequest: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }) => {
      try {
        const request = await getDMRequestById(input.requestId);

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "DM request not found",
          });
        }

        const result = await approveDMRequest({
          requestId: input.requestId,
          userId: ctx.user.id,
        });

        // Notify the requester
        await createDMApprovedNotification({
          requesterId: request.requesterId,
          recipientId: ctx.user.id,
          recipientName: ctx.user.name,
          conversationId: result.conversationId,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to approve DM request");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve DM request",
        });
      }
    }),

  /**
   * Deny a DM request
   */
  denyDMRequest: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }) => {
      try {
        const request = await getDMRequestById(input.requestId);

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "DM request not found",
          });
        }

        const result = await denyDMRequest({
          requestId: input.requestId,
          userId: ctx.user.id,
        });

        // Notify the requester
        await createDMDeniedNotification({
          requesterId: request.requesterId,
          recipientId: ctx.user.id,
          recipientName: ctx.user.name,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to deny DM request");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to deny DM request",
        });
      }
    }),

  /**
   * Close a conversation
   */
  closeConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }) => {
      try {
        return await closeConversation({
          conversationId: input.conversationId,
          userId: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to close conversation");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to close conversation",
        });
      }
    }),

  /**
   * Reopen a conversation
   */
  reopenConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input, ctx }) => {
      try {
        return await reopenConversation({
          conversationId: input.conversationId,
          userId: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        log.error(error, "Failed to reopen conversation");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reopen conversation",
        });
      }
    }),
});
