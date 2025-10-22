import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";

export type CouponsReturnType = Awaited<ReturnType<typeof getAllCoupons>>;
export type CouponByIdReturnType = Awaited<ReturnType<typeof getCouponById>>;
export type CouponByCodeReturnType = Awaited<
  ReturnType<typeof getCouponByCode>
>;

export const preparedGetAllCoupons = db.query.coupon
  .findMany({ with: { redemptions: true } })
  .prepare("getAllCoupons");

export const preparedGetCouponById = db.query.coupon
  .findFirst({
    where: (coupon) => eq(coupon.id, sql.placeholder("couponId")),
    with: {
      redemptions: true,
    },
  })
  .prepare("getCouponById");

export const preparedGetCouponByCode = db.query.coupon
  .findFirst({
    where: (coupon) => eq(coupon.code, sql.placeholder("couponCode")),
    with: {
      redemptions: true,
    },
  })
  .prepare("getCouponByCode");

export async function getAllCoupons() {
  const coupons = await preparedGetAllCoupons.execute();

  return coupons;
}

export async function getCouponById({ couponId }: { couponId: string }) {
  const coupon = await preparedGetCouponById.execute({ couponId });

  return coupon;
}

export async function getCouponByCode({ couponCode }: { couponCode: string }) {
  const coupon = await preparedGetCouponByCode.execute({ couponCode });

  return coupon;
}
