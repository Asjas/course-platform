import type { AllPurchases } from "@apps/server/src/routers/purchases/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type Purchase = AllPurchases[number];

export const PurchasesCollection = createCollection(
  queryCollectionOptions<Purchase>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.purchases.getAll.queryKey(),
    queryFn: () => trpcClient.purchases.getAll.query(),
  }),
);
