/**
 * Coupons Collection Hooks
 *
 * React hooks for accessing coupon data offline-first.
 */
import { CouponsCollection } from "./coupons.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

export function useCoupons() {
  return useLiveQuery(CouponsCollection);
}

export function useCouponById({ couponId }: { couponId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ coupon: CouponsCollection })
        .where(({ coupon }) => eq(coupon.id, couponId))
        .findOne();
    },
    [couponId],
  );
}
