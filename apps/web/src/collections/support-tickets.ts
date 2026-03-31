import type { AllSupportTickets } from "@apps/server/src/routers/support-tickets/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { getBackendErrorMessage } from "~/lib/api-error";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type SupportTicket = AllSupportTickets[number];

export const SupportTicketsCollection = createCollection(
  queryCollectionOptions<SupportTicket>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.supportTickets.getAll.queryKey(),
    queryFn: () => trpcClient.supportTickets.getAll.query(),
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];

        await trpcClient.supportTickets.createSupportTicket.mutate(modified);
      } catch (error) {
        console.error("Error inserting support ticket: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while creating the support ticket. Please try again.",
          ),
        );
        throw error;
      }
    },
    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];

        await trpcClient.supportTickets.deleteSupportTicket.mutate({
          ticketId: original.id,
        });
      } catch (error) {
        console.error("Error deleting support ticket: ", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while deleting the support ticket. Please try again.",
          ),
        );
        throw error;
      }
    },
  }),
);
