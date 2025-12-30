import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { chatMessageReport } from "~/db/schema/chatMessageReports.js";

// Type exports
export type AllChatReports = Awaited<ReturnType<typeof getAllChatReports>>;
export type ChatReportById = Awaited<ReturnType<typeof getChatReportById>>;

// Module-scoped prepared statements
const preparedGetAllChatReports = db.query.chatMessageReport
  .findMany({
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
  })
  .prepare("getAllChatReports");

const preparedGetChatReportById = db.query.chatMessageReport
  .findFirst({
    where: (reports) => eq(reports.id, sql.placeholder("reportId")),
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
  })
  .prepare("getChatReportById");

export async function getAllChatReports() {
  return preparedGetAllChatReports.execute();
}

export async function getChatReportById(reportId: string) {
  return preparedGetChatReportById.execute({ reportId });
}
