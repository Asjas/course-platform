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
  // Threading fields
  parentMessageId?: string; // If this is a reply, the ID of the parent message
  replyCount?: number; // Number of replies to this message
  latestReplyAt?: number; // Timestamp of the most recent reply
  latestReplyUserIds?: string[]; // User IDs who replied (for avatars)
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
 * Get the Redis key for storing thread metadata for a parent message.
 */
export function getThreadMetaKey(parentMessageId: string): string {
  return `chat:thread:${parentMessageId}:meta`;
}

/**
 * Get thread metadata for a parent message.
 */
export async function getThreadMeta(parentMessageId: string): Promise<{
  replyCount: number;
  latestReplyAt: number | null;
  latestReplyUserIds: string[];
}> {
  const metaKey = getThreadMetaKey(parentMessageId);
  const meta = await redis.hgetall(metaKey);

  return {
    replyCount: meta.replyCount ? parseInt(meta.replyCount, 10) : 0,
    latestReplyAt: meta.latestReplyAt ? parseInt(meta.latestReplyAt, 10) : null,
    latestReplyUserIds: meta.latestReplyUserIds
      ? (safeJsonParse<string[]>(meta.latestReplyUserIds) ?? [])
      : [],
  };
}

/**
 * Get channel message history with reactions.
 * Only returns top-level messages (not thread replies).
 * Includes thread metadata (reply count, latest reply) for each message.
 */
export async function getChannelHistory(channelId: string, limit = 50) {
  const streamKey = `chat:channel:${channelId}:messages`;
  // Fetch more messages to account for filtering out thread replies
  const entries = await redis.xrevrange(
    streamKey,
    "+",
    "-",
    "COUNT",
    limit * 2,
  );

  const allMessages = entries
    .map(([, fields]) =>
      safeJsonParse<ChatMessage>(fields[1], "getChannelHistory"),
    )
    .filter((msg): msg is ChatMessage => msg !== null);

  // Filter out thread replies (messages with parentMessageId) for main view
  const topLevelMessages = allMessages
    .filter((msg) => !msg.parentMessageId)
    .slice(0, limit);

  // Fetch reactions and thread metadata for all top-level messages using Redis pipeline
  const pipeline = redis.pipeline();
  for (const msg of topLevelMessages) {
    pipeline.hgetall(getReactionKey(msg.id));
    pipeline.hgetall(getThreadMetaKey(msg.id));
  }
  const pipelineResults = await pipeline.exec();

  // Combine messages with their reactions, thread metadata, and channelId
  const messagesWithReactions = topLevelMessages.map((msg, index) => {
    // Each message has 2 pipeline results: reactions and thread meta
    const reactionResult = pipelineResults?.[index * 2];
    const threadMetaResult = pipelineResults?.[index * 2 + 1];

    const reactions: Reaction[] = [];

    // Process reactions
    if (reactionResult && !reactionResult[0]) {
      const reactionData = reactionResult[1] as Record<string, string> | null;
      if (reactionData) {
        for (const [emoji, usersJson] of Object.entries(reactionData)) {
          const users = safeJsonParse<ReactionUser[]>(usersJson);
          if (users && Array.isArray(users)) {
            reactions.push({ emoji, users });
          }
        }
      }
    }

    // Process thread metadata
    let replyCount = 0;
    let latestReplyAt: number | undefined;
    let latestReplyUserIds: string[] | undefined;

    if (threadMetaResult && !threadMetaResult[0]) {
      const threadMeta = threadMetaResult[1] as Record<string, string> | null;
      if (threadMeta) {
        replyCount = threadMeta.replyCount
          ? parseInt(threadMeta.replyCount, 10)
          : 0;
        latestReplyAt = threadMeta.latestReplyAt
          ? parseInt(threadMeta.latestReplyAt, 10)
          : undefined;
        latestReplyUserIds = threadMeta.latestReplyUserIds
          ? (safeJsonParse<string[]>(threadMeta.latestReplyUserIds) ??
            undefined)
          : undefined;
      }
    }

    return {
      ...msg,
      reactions,
      channelId,
      replyCount: replyCount > 0 ? replyCount : undefined,
      latestReplyAt,
      latestReplyUserIds,
    };
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

/**
 * Get thread replies for a parent message.
 * Returns all messages that have the given parentMessageId.
 */
export async function getThreadReplies(
  channelId: string,
  parentMessageId: string,
  limit = 100,
) {
  const streamKey = `chat:channel:${channelId}:messages`;
  // Fetch more messages to find thread replies
  const entries = await redis.xrange(streamKey, "-", "+");

  const allMessages = entries
    .map(([, fields]) =>
      safeJsonParse<ChatMessage>(fields[1], "getThreadReplies"),
    )
    .filter((msg): msg is ChatMessage => msg !== null);

  // Filter to only thread replies for this parent
  const threadReplies = allMessages
    .filter((msg) => msg.parentMessageId === parentMessageId)
    .slice(0, limit);

  // Fetch reactions for all thread replies using Redis pipeline
  const pipeline = redis.pipeline();
  for (const msg of threadReplies) {
    pipeline.hgetall(getReactionKey(msg.id));
  }
  const reactionResults = await pipeline.exec();

  // Combine messages with their reactions and channelId
  const repliesWithReactions = threadReplies.map((msg, index) => {
    const pipelineResult = reactionResults?.[index];
    const reactions: Reaction[] = [];

    if (pipelineResult && !pipelineResult[0]) {
      const reactionData = pipelineResult[1] as Record<string, string> | null;
      if (reactionData) {
        for (const [emoji, usersJson] of Object.entries(reactionData)) {
          const users = safeJsonParse<ReactionUser[]>(usersJson);
          if (users && Array.isArray(users)) {
            reactions.push({ emoji, users });
          }
        }
      }
    }

    return { ...msg, reactions, channelId };
  });

  // Sort by creation time (oldest first for thread view)
  return repliesWithReactions.sort((a, b) => {
    if ("createdAt" in a && "createdAt" in b) {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    }
    return a.id.localeCompare(b.id);
  });
}

export type ThreadReplies = Awaited<ReturnType<typeof getThreadReplies>>;
