import { validateDMConversationAccess } from "./dmValidation.js";
import {
  type ChannelMessages,
  type DMMessages,
  type ThreadReplies,
  getChannelHistory,
  getDMHistory,
  getReactionKey,
  getReactionsForMessage,
  getThreadMetaKey,
  getThreadReplies,
} from "./queries.js";
import { TRPCError, tracked } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import { getUsersByUsernames } from "~/db/queries/user.js";
import { chatMessageCount, redisStreamOperations } from "~/lib/chat-metrics.js";
import { pinoLogger } from "~/lib/logging.js";
import { dispatchNotification } from "~/lib/notifications.js";
import { redis, subscriptionRedis } from "~/lib/redis.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";
import { getConversationById } from "~/routers/directMessages/queries.js";

const log = pinoLogger.child({ module: "routers:chat" });

/**
 * A single user's reaction to a message.
 */
export interface ReactionUser {
  userId: string;
  userName: string;
}

/**
 * Aggregated reactions for a specific emoji on a message.
 */
export interface Reaction {
  emoji: string;
  users: ReactionUser[];
}

export interface ChatMessage {
  id: string;
  message: string;
  name: string;
  username: string | null;
  color: string | null;
  timestamp: number;
  createdAt: number;
  editedAt?: number;
  reactions?: Reaction[];
  channelId?: string; // For channel messages
  conversationId?: string; // For DM messages
  // Threading fields
  parentMessageId?: string; // If this is a reply, the ID of the parent message
  replyCount?: number; // Number of replies to this message
  latestReplyAt?: number; // Timestamp of the most recent reply
  latestReplyUserIds?: string[]; // User IDs who replied (for avatars)
}

/**
 * Reaction update payload for SSE subscription.
 */
export interface ReactionUpdate {
  messageId: string;
  reactions: Reaction[];
  timestamp: number;
}

/**
 * Get the Redis stream key for reaction updates.
 */
function getReactionStreamKey(channelId: string): string {
  return `chat:reactions:stream:${channelId}`;
}

/**
 * Safely parse JSON with error handling.
 * Returns null if parsing fails instead of throwing.
 */
function safeJsonParse<T>(json: string, context?: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    log.error(
      { error, json: json.slice(0, 100), context },
      "Failed to parse JSON",
    );
    return null;
  }
}

function isIdAfter(current: string, previous: string): boolean {
  if (previous === "$") return true;
  if (previous === "0") return true;

  const [cTime, cSeq] = current.split("-").map(Number);
  const [pTime, pSeq] = previous.split("-").map(Number);

  return cTime > pTime || (cTime === pTime && cSeq > pSeq);
}

/**
 * Extract @mentioned usernames from a chat message.
 * Matches "@username" patterns (alphanumeric + underscores).
 */
function extractMentionedUsernames(message: string): string[] {
  const matches = message.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

export const chatRouter = router({
  getChannelMessages: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      const streamKey = `chat:channel:${input.channelId}:messages`;

      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "0" : "$");

      while (true) {
        try {
          const result = await subscriptionRedis.xread(
            "COUNT",
            100,
            "BLOCK",
            5000,
            "STREAMS",
            streamKey,
            lastId,
          );

          if (!result?.length) continue;

          const [[, entries]] = result;

          for (const [streamId, fields] of entries) {
            // Skip if not newer
            if (lastId !== "$" && !isIdAfter(streamId, lastId)) continue;

            const payload = safeJsonParse<ChatMessage>(
              fields[1],
              "getChannelMessages",
            );
            if (!payload) continue; // Skip corrupted messages

            // Skip thread replies - they should only appear in the thread panel
            if (payload.parentMessageId) {
              lastId = streamId;
              continue;
            }

            const messageId = payload.id; // ULID

            // Update lastId to Redis stream ID
            lastId = streamId;

            yield tracked(messageId, payload); // tRPC tracks by ULID
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            lastId = "$"; // fallback
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }),
  getChannelHistory: publicProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().default(50) }))
    .use(isAuthenticated)
    .query(async ({ input }): Promise<ChannelMessages> => {
      return getChannelHistory(input.channelId, input.limit);
    }),
  postMessage: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        message: z.string(),
        parentMessageId: z.string().optional(), // For thread replies
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const id = `msg:${ulid()}`;
      const now = Date.now();

      const payload: ChatMessage = {
        id,
        name: ctx.user.name,
        username: ctx.user.username,
        color: ctx.user.color,
        message: input.message,
        timestamp: now,
        createdAt: now,
        parentMessageId: input.parentMessageId,
      };

      const streamId = await redis.xadd(
        `chat:channel:${input.channelId}:messages`,
        "*",
        "message",
        JSON.stringify(payload),
      );

      // If this is a thread reply, update the parent message's thread metadata
      if (input.parentMessageId) {
        const threadMetaKey = getThreadMetaKey(input.parentMessageId);

        // Increment reply count
        await redis.hincrby(threadMetaKey, "replyCount", 1);
        // Update latest reply timestamp
        await redis.hset(threadMetaKey, "latestReplyAt", now.toString());

        // Update latest reply user IDs (keep last 3 unique users for avatar display)
        const currentUserIds = await redis.hget(
          threadMetaKey,
          "latestReplyUserIds",
        );
        const userIds: string[] = currentUserIds
          ? (safeJsonParse<string[]>(currentUserIds) ?? [])
          : [];

        // Add current user if not already in the list
        if (!userIds.includes(ctx.user.id)) {
          userIds.push(ctx.user.id);
        }

        // Keep only the last 3 users
        const latestUserIds = userIds.slice(-3);
        await redis.hset(
          threadMetaKey,
          "latestReplyUserIds",
          JSON.stringify(latestUserIds),
        );

        redisStreamOperations.inc({ operation: "hset", status: "success" });
      }

      chatMessageCount.inc({ channel: input.channelId, action: "post" });
      redisStreamOperations.inc({ operation: "xadd", status: "success" });

      // Dispatch "tagged_message" notifications to @mentioned users
      try {
        const mentionedUsernames = extractMentionedUsernames(input.message);
        if (mentionedUsernames.length > 0) {
          const mentionedUsers = await getUsersByUsernames(mentionedUsernames);
          await Promise.all(
            mentionedUsers
              // Don't notify the sender about their own mention
              .filter((u) => u.id !== ctx.user.id)
              .map((u) =>
                dispatchNotification({
                  userId: u.id,
                  baseKey: "chat:tagged_message",
                  browserNotification: {
                    type: "general",
                    title: `${ctx.user.name} mentioned you in #${input.channelId}`,
                    message: `"${input.message.slice(0, 120)}${input.message.length > 120 ? "…" : ""}"`,
                    link: `/chat/${input.channelId}`,
                  },
                  emailNotification: {
                    subject: `${ctx.user.name} mentioned you in #${input.channelId}`,
                    text: `${ctx.user.name} mentioned you in the #${input.channelId} channel:\n\n"${input.message}"`,
                  },
                }),
              ),
          );
        }
      } catch (mentionErr) {
        // TODO: report to Sentry once configured
        log.error(
          mentionErr,
          "Failed to dispatch tagged message notifications",
        );
      }

      return { ...payload, streamId };
    }),
  editMessage: publicProcedure
    .input(z.object({ id: z.string(), message: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ input }) => {
      const pattern = `chat:channel:*:messages`;
      const keys = await redis.keys(pattern);

      for (const streamKey of keys) {
        const entries = await redis.xrange(streamKey, "-", "+");

        for (const [streamId, fields] of entries) {
          const payload = safeJsonParse<ChatMessage>(fields[1], "editMessage");
          if (!payload) continue; // Skip corrupted messages

          if (payload.id === input.id) {
            await redis.xdel(streamKey, streamId);

            const updated: ChatMessage = {
              ...payload,
              message: input.message,
              editedAt: Date.now(),
            };

            await redis.xadd(
              streamKey,
              "*",
              "message",
              JSON.stringify(updated),
            );

            chatMessageCount.inc({ channel: streamKey, action: "edit" });
            redisStreamOperations.inc({ operation: "xadd", status: "success" });

            return updated;
          }
        }
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Message not found",
      });
    }),
  deleteMessage: publicProcedure
    .input(z.object({ id: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const streamKeyPattern = `chat:channel:*:messages`;
      const streamKeys = await redis.keys(streamKeyPattern);

      for (const key of streamKeys) {
        const entries = await redis.xrange(key, "-", "+");

        for (const [streamId, fields] of entries) {
          const messageJson = fields[1];
          const message = safeJsonParse<ChatMessage>(
            messageJson,
            "deleteMessage",
          );
          if (!message) continue; // Skip corrupted messages

          if (message.id === input.id) {
            await redis.xdel(key, streamId);

            // If this was a thread reply, decrement the parent's reply count
            if (message.parentMessageId) {
              const threadMetaKey = getThreadMetaKey(message.parentMessageId);

              // Decrement reply count (min 0)
              const currentCount = await redis.hget(
                threadMetaKey,
                "replyCount",
              );
              const newCount = Math.max(
                0,
                (currentCount ? parseInt(currentCount, 10) : 0) - 1,
              );

              if (newCount === 0) {
                // No more replies, clean up thread metadata
                await redis.del(threadMetaKey);
              } else {
                await redis.hset(
                  threadMetaKey,
                  "replyCount",
                  newCount.toString(),
                );
              }

              redisStreamOperations.inc({
                operation: "hset",
                status: "success",
              });
            }

            chatMessageCount.inc({ channel: key, action: "delete" });
            redisStreamOperations.inc({ operation: "xdel", status: "success" });

            ctx.request.log.debug(
              `User ${ctx.user.id} deleted ${input.id} from ${key}`,
            );
            return { success: true };
          }
        }
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Message not found",
      });
    }),
  /**
   * Toggle a reaction on a message. If the user already has this reaction, it's removed.
   * Otherwise, it's added.
   *
   * Note: Reactions are stored separately from messages in Redis hashes.
   * This avoids race conditions and the need to republish messages when reactions change.
   * After updating, publishes to a reaction stream for SSE subscribers.
   */
  toggleReaction: publicProcedure
    .input(
      z.object({
        messageId: z.string(),
        emoji: z.string().min(1).max(10),
        channelId: z.string(), // Required to publish to the correct reaction stream
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      const reactionKey = getReactionKey(input.messageId);
      const userId = ctx.user.id;
      const userName = ctx.user.name;

      // Get current reactions for this emoji with safe parsing
      const currentData = await redis.hget(reactionKey, input.emoji);
      const users: ReactionUser[] = currentData
        ? (safeJsonParse<ReactionUser[]>(currentData) ?? [])
        : [];

      // Check if user already reacted with this emoji
      const userIndex = users.findIndex((u) => u.userId === userId);

      if (userIndex >= 0) {
        // Remove the reaction
        users.splice(userIndex, 1);
        if (users.length === 0) {
          await redis.hdel(reactionKey, input.emoji);
        } else {
          await redis.hset(reactionKey, input.emoji, JSON.stringify(users));
        }
      } else {
        // Add the reaction
        users.push({ userId, userName });
        await redis.hset(reactionKey, input.emoji, JSON.stringify(users));
      }

      redisStreamOperations.inc({ operation: "hset", status: "success" });

      // Fetch updated reactions and publish to stream for SSE subscribers
      const updatedReactions = await getReactionsForMessage(input.messageId);
      const reactionUpdate: ReactionUpdate = {
        messageId: input.messageId,
        reactions: updatedReactions,
        timestamp: Date.now(),
      };

      // Publish to the reaction stream for this channel
      await redis.xadd(
        getReactionStreamKey(input.channelId),
        "MAXLEN",
        "~",
        "1000", // Keep last ~1000 reaction updates per channel
        "*",
        "data",
        JSON.stringify(reactionUpdate),
      );

      redisStreamOperations.inc({ operation: "xadd", status: "success" });

      return updatedReactions;
    }),
  /**
   * Subscribe to reaction updates for a channel via SSE.
   * Clients receive real-time updates when any message in the channel has reactions changed.
   */
  subscribeToReactions: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      const streamKey = getReactionStreamKey(input.channelId);

      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "$" : "$");

      while (true) {
        try {
          const result = await subscriptionRedis.xread(
            "COUNT",
            100,
            "BLOCK",
            5000,
            "STREAMS",
            streamKey,
            lastId,
          );

          if (!result?.length) continue;

          const [[, entries]] = result;

          for (const [streamId, fields] of entries) {
            const payload = safeJsonParse<ReactionUpdate>(
              fields[1],
              "subscribeToReactions",
            );
            if (!payload) continue; // Skip corrupted data

            // Update lastId to Redis stream ID
            lastId = streamId;

            // Use messageId as the tracking ID for deduplication
            yield tracked(payload.messageId, payload);
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            lastId = "$"; // fallback
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }),
  /**
   * Get DM messages (subscription)
   */
  getDMMessages: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input, ctx }) {
      // Verify user has access to this conversation
      await validateDMConversationAccess(
        input.conversationId,
        ctx.user.id,
        ctx.user.role,
      );

      const streamKey = `chat:dm:${input.conversationId}:messages`;

      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "0" : "$");

      while (true) {
        try {
          const result = await subscriptionRedis.xread(
            "COUNT",
            100,
            "BLOCK",
            5000,
            "STREAMS",
            streamKey,
            lastId,
          );

          if (!result?.length) continue;

          const [[, entries]] = result;

          for (const [streamId, fields] of entries) {
            // Skip if not newer
            if (lastId !== "$" && !isIdAfter(streamId, lastId)) continue;

            const payload = safeJsonParse<ChatMessage>(
              fields[1],
              "getDMMessages",
            );
            if (!payload) continue; // Skip corrupted messages

            const messageId = payload.id; // ULID

            // Update lastId to Redis stream ID
            lastId = streamId;

            yield tracked(messageId, payload); // tRPC tracks by ULID
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            lastId = "$"; // fallback
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }),
  /**
   * Get DM history
   */
  getDMHistory: publicProcedure
    .input(
      z.object({ conversationId: z.string(), limit: z.number().default(50) }),
    )
    .use(isAuthenticated)
    .query(async ({ input, ctx }): Promise<DMMessages> => {
      // Verify user has access to this conversation
      await validateDMConversationAccess(
        input.conversationId,
        ctx.user.id,
        ctx.user.role,
      );

      return getDMHistory(input.conversationId, input.limit);
    }),
  /**
   * Get thread replies for a parent message
   */
  getThreadReplies: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        parentMessageId: z.string(),
        limit: z.number().default(50),
      }),
    )
    .use(isAuthenticated)
    .query(async ({ input }): Promise<ThreadReplies> => {
      return getThreadReplies(
        input.channelId,
        input.parentMessageId,
        input.limit,
      );
    }),
  /**
   * Subscribe to thread replies for a parent message
   */
  subscribeToThread: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        parentMessageId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      const streamKey = `chat:channel:${input.channelId}:messages`;

      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "$" : "$");

      while (true) {
        try {
          const result = await subscriptionRedis.xread(
            "COUNT",
            100,
            "BLOCK",
            5000,
            "STREAMS",
            streamKey,
            lastId,
          );

          if (!result?.length) continue;

          const [[, entries]] = result;

          for (const [streamId, fields] of entries) {
            const payload = safeJsonParse<ChatMessage>(
              fields[1],
              "subscribeToThread",
            );
            if (!payload) continue; // Skip corrupted messages

            // Only yield messages that belong to this thread
            if (payload.parentMessageId !== input.parentMessageId) continue;

            const messageId = payload.id; // ULID

            // Update lastId to Redis stream ID
            lastId = streamId;

            yield tracked(messageId, payload); // tRPC tracks by ULID
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            lastId = "$"; // fallback
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }),
  /**
   * Post a DM message
   */
  postDMMessage: publicProcedure
    .input(z.object({ conversationId: z.string(), message: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant (admins can only read, not write)
      await validateDMConversationAccess(
        input.conversationId,
        ctx.user.id,
        ctx.user.role,
        true, // allowWriteOnly = true (only participants can send messages)
      );

      const id = `msg:${ulid()}`;

      const payload: ChatMessage = {
        id,
        name: ctx.user.name,
        username: ctx.user.username,
        color: ctx.user.color,
        message: input.message,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      const streamId = await redis.xadd(
        `chat:dm:${input.conversationId}:messages`,
        "*",
        "message",
        JSON.stringify(payload),
      );

      chatMessageCount.inc({
        channel: `dm:${input.conversationId}`,
        action: "post",
      });
      redisStreamOperations.inc({ operation: "xadd", status: "success" });

      // Dispatch "dm_message" notification to the other participant
      try {
        const conversation = await getConversationById(input.conversationId);
        if (conversation) {
          const recipientId =
            conversation.user1Id === ctx.user.id
              ? conversation.user2Id
              : conversation.user1Id;

          await dispatchNotification({
            userId: recipientId,
            baseKey: "chat:dm_message",
            browserNotification: {
              type: "general",
              title: `New message from ${ctx.user.name}`,
              message: `"${input.message.slice(0, 120)}${input.message.length > 120 ? "…" : ""}"`,
              link: `/chat/dm/${input.conversationId}`,
            },
            emailNotification: {
              subject: `New direct message from ${ctx.user.name}`,
              text: `${ctx.user.name} sent you a direct message:\n\n"${input.message}"`,
            },
          });
        }
      } catch (dmNotifErr) {
        // TODO: report to Sentry once configured
        log.error(dmNotifErr, "Failed to dispatch DM message notification");
      }

      return { ...payload, streamId };
    }),
});
