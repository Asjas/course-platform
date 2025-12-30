import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  type NewChatMessageReport,
  chatMessageReport,
} from "~/db/schema/chatMessageReports.js";
import { redis } from "~/lib/redis.js";

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
  const streamKey = `chat:channel:${channelId}:messages`;
  const entries = await redis.xrange(streamKey, "-", "+");

  for (const [streamId, fields] of entries) {
    const messageData = JSON.parse(fields[1]) as { id: string };
    if (messageData.id === messageId) {
      await redis.xdel(streamKey, streamId);
      return true;
    }
  }

  return false;
}
