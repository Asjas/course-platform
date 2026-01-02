/**
 * Chat Reports Hooks
 *
 * React hooks for accessing the chat reports collection.
 */
import { ChatReportsCollection } from "./chat-reports.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

/**
 * Get all chat reports.
 * Uses the offline-first collection.
 */
export function useChatReports() {
  return useLiveQuery(ChatReportsCollection);
}

/**
 * Get a single chat report by ID.
 * Returns the report from the offline collection.
 */
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
