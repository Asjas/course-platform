/**
 * Chat Reports Collection
 *
 * Offline-first collection for chat reports (admin only).
 * Supports optimistic updates for status changes.
 */
import type { AllChatReports } from "@apps/server/src/routers/chatReports/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type ChatReport = AllChatReports[number];

/**
 * Chat reports collection for admin moderation.
 * Supports optimistic updates for status changes.
 */
export const ChatReportsCollection = createCollection(
  queryCollectionOptions<ChatReport>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.chatReports.getAll.queryKey(),
    queryFn: () => trpcClient.chatReports.getAll.query(),
    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        // Only sync non-pending status changes
        if (modified.status === "pending") {
          return;
        }

        await trpcClient.chatReports.updateReportStatus.mutate({
          reportId: modified.id,
          status: modified.status,
        });
      } catch (error) {
        console.error("Error updating chat report status:", error);
        toast.error("Failed to update report status. Please try again.");
        throw error;
      }
    },
  }),
);
