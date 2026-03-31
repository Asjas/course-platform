import { eq, useLiveQuery } from "@tanstack/react-db";
import { ChatReportsCollection } from "~/collections/chat-reports";

export function useChatReports() {
  return useLiveQuery(ChatReportsCollection);
}

export function useChatReportById({ reportId }: { reportId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ report: ChatReportsCollection })
        .where(({ report }) => eq(report.id, reportId))
        .findOne();
    },
    [reportId],
  );
}
