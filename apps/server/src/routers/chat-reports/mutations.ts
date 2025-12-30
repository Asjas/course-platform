import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { chatMessageReport } from "~/db/schema/chat-message-reports.js";
import { user } from "~/db/schema/user.js";
import { userNotification } from "~/db/schema/userNotifications.js";

export async function createReport(data: {
  id: string;
  messageId: string;
  channelId: string;
  reportedBy: string;
  reason: string;
  messageContent: string;
  messageAuthor: string;
}) {
  const [report] = await db.insert(chatMessageReport).values(data).returning();

  // Get all admin users to notify
  const adminUsers = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.role, "admin"));

  // Create notifications for all admin users
  const notifications = adminUsers.map((admin) => ({
    id: ulid(),
    userId: admin.id,
    type: "admin_chat_message_reported" as const,
    title: "Chat Message Reported",
    message: `A message in #${data.channelId} by ${data.messageAuthor} has been reported for: ${data.reason}`,
    link: `/admin/chat-reports`,
    chatMessageReportId: report.id,
    actorId: data.reportedBy,
  }));

  if (notifications.length > 0) {
    await db.insert(userNotification).values(notifications);
  }

  return report;
}

export async function updateReportStatus(data: {
  reportId: string;
  status: "reviewed" | "dismissed";
  reviewedBy: string;
}) {
  const [report] = await db
    .update(chatMessageReport)
    .set({
      status: data.status,
      reviewedAt: new Date(),
      reviewedBy: data.reviewedBy,
    })
    .where(eq(chatMessageReport.id, data.reportId))
    .returning();

  return report;
}

export async function deleteReport(reportId: string) {
  await db.delete(chatMessageReport).where(eq(chatMessageReport.id, reportId));
}
