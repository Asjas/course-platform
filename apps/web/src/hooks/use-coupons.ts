import { eq, useLiveQuery } from "@tanstack/react-db";
import { CouponsCollection } from "~/collections/coupons";

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
