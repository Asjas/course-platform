/**
 * Purchases Collection
 *
 * Provides data access for Polar purchases/orders.
 * Read-only collection - purchases come from Polar API.
 */
import type { AllPurchases } from "@apps/server/src/routers/purchases/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, gt, useLiveQuery } from "@tanstack/react-db";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type Purchase = AllPurchases[number];

export const PurchasesCollection = createCollection(
  queryCollectionOptions<Purchase>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.purchases.getAll.queryKey(),
    queryFn: () => trpcClient.purchases.getAll.query(),
    // Read-only collection - no onInsert, onUpdate, onDelete
  }),
);

export function usePurchases() {
  return useLiveQuery(PurchasesCollection);
}

export function usePurchaseById({ purchaseId }: { purchaseId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ purchase: PurchasesCollection })
        .where(({ purchase }) => eq(purchase.id, purchaseId))
        .findOne();
    },
    [purchaseId],
  );
}

export function useRefundedPurchases() {
  return useLiveQuery((query) => {
    return query
      .from({ purchase: PurchasesCollection })
      .where(({ purchase }) => gt(purchase.refundedAmount, 0))
      .select(({ purchase }) => purchase);
  });
}

export function useActivePurchases() {
  return useLiveQuery((query) => {
    return query
      .from({ purchase: PurchasesCollection })
      .where(({ purchase }) => eq(purchase.refundedAmount, 0))
      .select(({ purchase }) => purchase);
  });
}
