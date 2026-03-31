import type { AllEarlySignups } from "@apps/server/src/routers/earlySignups/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { getBackendErrorMessage } from "~/lib/api-error";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type EarlySignup = AllEarlySignups[number];

export const EarlySignupsCollection = createCollection(
  queryCollectionOptions<EarlySignup>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.earlySignups.getAll.queryKey(),
    queryFn: () => trpcClient.earlySignups.getAll.query(),
    onUpdate: async ({ transaction }) => {
      try {
        const { original, modified } = transaction.mutations[0];

        if (!original.unsubscribedAt && modified.unsubscribedAt) {
          await trpcClient.earlySignups.cancelInvite.mutate({
            id: original.id,
          });
          return;
        }

        await trpcClient.earlySignups.sendInvite.mutate({ id: original.id });
      } catch (error) {
        console.error("Error sending early signup invite:", error);
        toast.error(
          getBackendErrorMessage(
            error,
            "An error occurred while sending the invite. Please try again.",
          ),
        );
        throw error;
      }
    },
  }),
);
