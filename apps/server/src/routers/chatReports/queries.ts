import { desc } from "drizzle-orm";
import { db } from "~/db/index.js";
import { chatMessageReport } from "~/db/schema/chatMessageReports.js";

export async function getAllChatReports() {
  return db.query.chatMessageReport.findMany({
    orderBy: [desc(chatMessageReport.createdAt)],
    with: {
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getChatReportById(reportId: string) {
  return db.query.chatMessageReport.findFirst({
    where: (reports, { eq }) => eq(reports.id, reportId),
    with: {
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// Type exports
export type AllChatReports = Awaited<ReturnType<typeof getAllChatReports>>;
export type ChatReportById = Awaited<ReturnType<typeof getChatReportById>>;
