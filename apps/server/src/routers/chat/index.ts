import { tracked } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import { chatMessageCount, redisStreamOperations } from "~/lib/chat-metrics.js";
import { redis, subscriptionRedis } from "~/lib/redis.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

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
}

/**
 * Get the Redis key for storing reactions for a message.
 */
function getReactionKey(messageId: string): string {
  return `chat:reactions:${messageId}`;
}

/**
 * Safely parse JSON with error handling.
 * Returns null if parsing fails instead of throwing.
 */
function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Get all reactions for a message from the separate Redis hash.
 * Reactions are stored separately from messages to avoid race conditions
 * and the need to republish messages when reactions change.
 */
async function getReactionsForMessage(messageId: string): Promise<Reaction[]> {
  const reactionKey = getReactionKey(messageId);
  const allReactions = await redis.hgetall(reactionKey);

  const reactions: Reaction[] = [];
  for (const [emoji, usersJson] of Object.entries(allReactions)) {
    const users = safeJsonParse<ReactionUser[]>(usersJson);
    // Skip corrupted data instead of crashing
    if (users && Array.isArray(users)) {
      reactions.push({ emoji, users });
    }
  }

  return reactions;
}

function isIdAfter(current: string, previous: string): boolean {
  if (previous === "$") return true;
  if (previous === "0") return true;

  const [cTime, cSeq] = current.split("-").map(Number);
  const [pTime, pSeq] = previous.split("-").map(Number);

  return cTime > pTime || (cTime === pTime && cSeq > pSeq);
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

            const payload: ChatMessage = JSON.parse(fields[1]) as ChatMessage;
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
    .query(async ({ input }) => {
      const streamKey = `chat:channel:${input.channelId}:messages`;
      const entries = await redis.xrevrange(
        streamKey,
        "+",
        "-",
        "COUNT",
        input.limit,
      );

      const messages = entries.map(
        ([, fields]) => JSON.parse(fields[1]) as ChatMessage,
      );

      // Fetch reactions for all messages using Redis pipeline for efficiency
      // (reactions are stored separately to avoid race conditions)
      const pipeline = redis.pipeline();
      for (const msg of messages) {
        pipeline.hgetall(getReactionKey(msg.id));
      }
      const reactionResults = await pipeline.exec();

      // Combine messages with their reactions
      const messagesWithReactions = messages.map((msg, index) => {
        const pipelineResult = reactionResults?.[index];
        const reactions: Reaction[] = [];

        // Check for pipeline errors before processing
        if (pipelineResult && !pipelineResult[0]) {
          const reactionData = pipelineResult[1] as Record<
            string,
            string
          > | null;
          if (reactionData) {
            for (const [emoji, usersJson] of Object.entries(reactionData)) {
              const users = safeJsonParse<ReactionUser[]>(usersJson);
              // Skip corrupted data instead of crashing
              if (users && Array.isArray(users)) {
                reactions.push({ emoji, users });
              }
            }
          }
        }

        return { ...msg, reactions };
      });

      // Sort by creation time (ULID or createdAt field)
      return messagesWithReactions.sort((a, b) => {
        if ("createdAt" in a && "createdAt" in b) {
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        }
        return a.id.localeCompare(b.id);
      });
    }),
  postMessage: publicProcedure
    .input(z.object({ channelId: z.string(), message: z.string() }))
    .use(isAuthenticated)
    .mutation(async ({ ctx, input }) => {
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
        `chat:channel:${input.channelId}:messages`,
        "*",
        "message",
        JSON.stringify(payload),
      );

      chatMessageCount.inc({ channel: input.channelId, action: "post" });
      redisStreamOperations.inc({ operation: "xadd", status: "success" });

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
          const payload: ChatMessage = JSON.parse(fields[1]) as ChatMessage;

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
      throw new Error("Message not found");
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
          const message: ChatMessage = JSON.parse(messageJson) as ChatMessage;

          if (message.id === input.id) {
            await redis.xdel(key, streamId);

            chatMessageCount.inc({ channel: key, action: "delete" });
            redisStreamOperations.inc({ operation: "xdel", status: "success" });

            ctx.request.log.debug(
              `User ${ctx.user.id} deleted ${input.id} from ${key}`,
            );
            return { success: true };
          }
        }
      }

      throw new Error("Message not found");
    }),
  /**
   * Get reactions for a specific message.
   */
  getMessageReactions: publicProcedure
    .input(z.object({ messageId: z.string() }))
    .use(isAuthenticated)
    .query(async ({ input }) => {
      return getReactionsForMessage(input.messageId);
    }),
  /**
   * Toggle a reaction on a message. If the user already has this reaction, it's removed.
   * Otherwise, it's added.
   *
   * Note: Reactions are stored separately from messages in Redis hashes.
   * This avoids race conditions and the need to republish messages when reactions change.
   * The frontend updates its local cache with the returned reactions.
   */
  toggleReaction: publicProcedure
    .input(
      z.object({
        messageId: z.string(),
        emoji: z.string().min(1).max(10),
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

      return getReactionsForMessage(input.messageId);
    }),
});
