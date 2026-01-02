/**
 * Chat Reports Collection
 *
 * Offline-first collection for chat reports (admin only).
 * Read-only collection for viewing reported messages.
 */
import type { AllChatReports } from "@apps/server/src/routers/chatReports/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type ChatReport = AllChatReports[number];

/**
 * Chat reports collection for admin moderation.
 * Read-only - reports are created via the chat interface.
 */
export const ChatReportsCollection = createCollection(
  queryCollectionOptions<ChatReport>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.chatReports.getAll.queryKey(),
    queryFn: () => trpcClient.chatReports.getAll.query(),
  }),
);
