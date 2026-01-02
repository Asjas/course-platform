import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type NewChatMessageReport,
  chatMessageReport,
} from "~/db/schema/chatMessageReports.js";
import { pinoLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";

const log = pinoLogger.child({ module: "routers:chatReports:mutations" });

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

export async function insertChatReport(report: NewChatMessageReport) {
  const [inserted] = await db
    .insert(chatMessageReport)
    .values(report)
    .returning();

  return inserted;
}

export async function updateReportStatus({
  reportId,
  status,
  reviewedBy,
}: {
  reportId: string;
  status: "reviewed" | "dismissed" | "actioned";
  reviewedBy: string;
}) {
  const [updated] = await db
    .update(chatMessageReport)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
    })
    .where(eq(chatMessageReport.id, reportId))
    .returning();

  return updated;
}

export async function deleteReportedMessageFromRedis({
  messageId,
  channelId,
}: {
  messageId: string;
  channelId: string;
}) {
  // Check if this is a DM (starts with "dm:" prefix) or a regular channel
  const streamKey = channelId.startsWith("dm:")
    ? `chat:${channelId}:messages`
    : `chat:channel:${channelId}:messages`;

  const entries = await redis.xrange(streamKey, "-", "+");

  for (const [streamId, fields] of entries) {
    const messageData = safeJsonParse<{ id: string }>(
      fields[1],
      "deleteReportedMessageFromRedis",
    );
    if (!messageData) continue; // Skip corrupted messages

    if (messageData.id === messageId) {
      await redis.xdel(streamKey, streamId);
      return true;
    }
  }

  return false;
}
