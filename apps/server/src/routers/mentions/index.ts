import { and, asc, eq, inArray, ne, not } from "drizzle-orm";
import * as z from "zod";
import { db } from "~/db/index.js";
import { directMessageConversation } from "~/db/schema/directMessages.js";
import { supportTicket } from "~/db/schema/support-tickets.js";
import { user } from "~/db/schema/user.js";
import { redis } from "~/lib/redis.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

/**
 * Mentionable user type returned by all mention endpoints
 */
export interface MentionableUser {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
}

/**
 * Get the Redis key for storing channel members
 */
function getChannelMembersKey(channelId: string): string {
  return `chat:channel:${channelId}:members`;
}

export const mentionsRouter = router({
  /**
   * Get mentionable users for a chat channel.
   * Returns all users in the channel except the current user.
   */
  getChannelMentions: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ ctx, input }): Promise<MentionableUser[]> => {
      const currentUserId = ctx.user.id;

      // Try to get members from Redis first
      const membersKey = getChannelMembersKey(input.channelId);
      const cachedMemberIds = await redis.smembers(membersKey);

      if (cachedMemberIds.length > 0) {
        // Filter out current user
        const memberIds = cachedMemberIds.filter((id) => id !== currentUserId);

        if (memberIds.length === 0) {
          return [];
        }

        // Fetch user details from DB
        const users = await db.query.user.findMany({
          where: inArray(user.id, memberIds),
          columns: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
          },
          orderBy: [asc(user.name)],
        });

        return users;
      }

      // Fallback: If no cached members, return all users except ghost and current user
      // This is a temporary measure until members are properly tracked
      const users = await db.query.user.findMany({
        where: and(ne(user.id, currentUserId), not(eq(user.username, "ghost"))),
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          image: true,
        },
        orderBy: [asc(user.name)],
      });

      return users;
    }),

  /**
   * Get mentionable users for a direct message conversation.
   * Returns only the other participant in the conversation.
   */
  getDMMentions: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ ctx, input }): Promise<MentionableUser[]> => {
      const currentUserId = ctx.user.id;

      // Get the conversation to find the other user
      const conversation = await db.query.directMessageConversation.findFirst({
        where: eq(directMessageConversation.id, input.conversationId),
        with: {
          user1: {
            columns: {
              id: true,
              name: true,
              username: true,
              displayUsername: true,
              image: true,
            },
          },
          user2: {
            columns: {
              id: true,
              name: true,
              username: true,
              displayUsername: true,
              image: true,
            },
          },
        },
      });

      if (!conversation) {
        return [];
      }

      // Return the other user (not the current user)
      const otherUser =
        conversation.user1.id === currentUserId
          ? conversation.user2
          : conversation.user1;

      return [otherUser];
    }),

  /**
   * Get mentionable users for a support ticket.
   * - For non-admins: ticket creator, commenters, and admins
   * - For admins: ticket creator and commenters (not other admins)
   */
  getSupportTicketMentions: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ ctx, input }): Promise<MentionableUser[]> => {
      const currentUserId = ctx.user.id;
      const isUserAdmin = ctx.user.role === "admin";

      // Get the ticket with its creator and comments
      const ticket = await db.query.supportTicket.findFirst({
        where: eq(supportTicket.id, input.ticketId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              username: true,
              displayUsername: true,
              image: true,
            },
          },
          comments: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!ticket) {
        return [];
      }

      // Collect unique user IDs from ticket creator and commenters
      const userIds = new Set<string>();
      userIds.add(ticket.user.id);
      ticket.comments.forEach((comment) => {
        userIds.add(comment.userId);
      });

      // Remove current user from the set
      userIds.delete(currentUserId);

      // If not admin, also add all admins to the mentionable list
      if (!isUserAdmin) {
        const admins = await db.query.user.findMany({
          where: and(eq(user.role, "admin"), ne(user.id, currentUserId)),
          columns: {
            id: true,
          },
        });

        admins.forEach((admin) => {
          userIds.add(admin.id);
        });
      }

      if (userIds.size === 0) {
        return [];
      }

      // Fetch user details
      const users = await db.query.user.findMany({
        where: inArray(user.id, Array.from(userIds)),
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          image: true,
        },
        orderBy: [asc(user.name)],
      });

      return users;
    }),

  /**
   * Track a user joining a channel (for real-time member tracking).
   * Call this when a user joins/views a channel.
   */
  joinChannel: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const userId = ctx.user.id;
      const membersKey = getChannelMembersKey(input.channelId);

      // Add user to the channel members set with 1 hour expiry
      await redis.sadd(membersKey, userId);
      // Refresh expiry on the set
      await redis.expire(membersKey, 3600); // 1 hour

      return { success: true };
    }),

  /**
   * Track a user leaving a channel.
   * Call this when a user navigates away from a channel.
   */
  leaveChannel: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const userId = ctx.user.id;
      const membersKey = getChannelMembersKey(input.channelId);

      await redis.srem(membersKey, userId);

      return { success: true };
    }),
});
