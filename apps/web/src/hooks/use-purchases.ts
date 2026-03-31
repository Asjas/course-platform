import { eq, gt, useLiveQuery } from "@tanstack/react-db";
import { PurchasesCollection } from "~/collections/purchases";

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
