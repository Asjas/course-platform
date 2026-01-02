import type { Reaction, ReactionUser } from "./index.js";
import { pinoLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";

const log = pinoLogger.child({ module: "routers:chat:queries" });

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
}

/**
 * Get the Redis key for storing reactions for a message.
 */
export function getReactionKey(messageId: string): string {
  return `chat:reactions:${messageId}`;
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

/**
 * Get all reactions for a message from the separate Redis hash.
 * Reactions are stored separately from messages to avoid race conditions
 * and the need to republish messages when reactions change.
 */
export async function getReactionsForMessage(
  messageId: string,
): Promise<Reaction[]> {
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

/**
 * Get channel message history with reactions.
 */
export async function getChannelHistory(channelId: string, limit = 50) {
  const streamKey = `chat:channel:${channelId}:messages`;
  const entries = await redis.xrevrange(streamKey, "+", "-", "COUNT", limit);

  const messages = entries
    .map(([, fields]) =>
      safeJsonParse<ChatMessage>(fields[1], "getChannelHistory"),
    )
    .filter((msg): msg is ChatMessage => msg !== null);

  // Fetch reactions for all messages using Redis pipeline for efficiency
  const pipeline = redis.pipeline();
  for (const msg of messages) {
    pipeline.hgetall(getReactionKey(msg.id));
  }
  const reactionResults = await pipeline.exec();

  // Combine messages with their reactions and add channelId
  const messagesWithReactions = messages.map((msg, index) => {
    const pipelineResult = reactionResults?.[index];
    const reactions: Reaction[] = [];

    // Check for pipeline errors before processing
    if (pipelineResult && !pipelineResult[0]) {
      const reactionData = pipelineResult[1] as Record<string, string> | null;
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

    return { ...msg, reactions, channelId };
  });

  // Sort by creation time (ULID or createdAt field)
  return messagesWithReactions.sort((a, b) => {
    if ("createdAt" in a && "createdAt" in b) {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Get DM message history with reactions.
 */
export async function getDMHistory(conversationId: string, limit = 50) {
  const streamKey = `chat:dm:${conversationId}:messages`;
  const entries = await redis.xrevrange(streamKey, "+", "-", "COUNT", limit);

  const messages = entries
    .map(([, fields]) => safeJsonParse<ChatMessage>(fields[1], "getDMHistory"))
    .filter((msg): msg is ChatMessage => msg !== null);

  // Fetch reactions for all messages using Redis pipeline for efficiency
  const pipeline = redis.pipeline();
  for (const msg of messages) {
    pipeline.hgetall(getReactionKey(msg.id));
  }
  const reactionResults = await pipeline.exec();

  // Combine messages with their reactions and add conversationId
  const messagesWithReactions = messages.map((msg, index) => {
    const pipelineResult = reactionResults?.[index];
    const reactions: Reaction[] = [];

    // Check for pipeline errors before processing
    if (pipelineResult && !pipelineResult[0]) {
      const reactionData = pipelineResult[1] as Record<string, string> | null;
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

    return { ...msg, reactions, conversationId };
  });

  // Sort by creation time (ULID or createdAt field)
  return messagesWithReactions.sort((a, b) => {
    if ("createdAt" in a && "createdAt" in b) {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    }
    return a.id.localeCompare(b.id);
  });
}

// Type exports for frontend collections
export type ChannelMessages = Awaited<ReturnType<typeof getChannelHistory>>;
export type DMMessages = Awaited<ReturnType<typeof getDMHistory>>;
