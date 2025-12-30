import { desc } from "drizzle-orm";
import { db } from "~/db/index.js";
import { chatMessageReport } from "~/db/schema/chat-message-reports.js";

// Prepared statement for getting all reports (admin only)
const getAllReportsStatement = db
  .select({
    id: chatMessageReport.id,
    messageId: chatMessageReport.messageId,
    channelId: chatMessageReport.channelId,
    reportedBy: chatMessageReport.reportedBy,
    reason: chatMessageReport.reason,
    messageContent: chatMessageReport.messageContent,
    messageAuthor: chatMessageReport.messageAuthor,
    status: chatMessageReport.status,
    createdAt: chatMessageReport.createdAt,
    reviewedAt: chatMessageReport.reviewedAt,
    reviewedBy: chatMessageReport.reviewedBy,
  })
  .from(chatMessageReport)
  .orderBy(desc(chatMessageReport.createdAt))
  .prepare("get_all_chat_reports");

export async function getAllReports() {
  return getAllReportsStatement.execute();
}

export type AllReports = Awaited<ReturnType<typeof getAllReports>>;
