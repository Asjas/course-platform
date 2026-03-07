import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  type Coupon,
  type NewCoupon,
  coupon,
  couponRedemption,
} from "~/db/schema/coupon.js";
import { preparedGetCouponByCode } from "~/routers/coupons/queries.js";

type NewCouponWithOptionalId = NewCoupon & { id?: string };

export async function insertCoupon({
  newCoupon,
}: {
  newCoupon: NewCouponWithOptionalId;
}) {
  const id = newCoupon.id ?? `coup:${ulid()}`;
  const newCouponWithId = { id, ...newCoupon };

  const [result] = await db.insert(coupon).values(newCouponWithId).returning();

  return result;
}

export async function updateCouponById({
  couponId,
  updates,
}: {
  couponId: string;
  updates: Partial<Coupon>;
}) {
  const [result] = await db
    .update(coupon)
    .set({ ...updates })
    .where(eq(coupon.id, couponId))
    .returning();

  return result;
}

export async function deleteCouponById({ couponId }: { couponId: string }) {
  const [result] = await db
    .delete(coupon)
    .where(eq(coupon.id, couponId))
    .returning();

  return result;
}

export async function redeemCouponByCode({
  couponCode,
  paymentId,
  courseId,
}: {
  couponCode: string;
  paymentId: string;
  courseId: string;
}) {
  const coupon = await preparedGetCouponByCode.execute({ couponCode });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  const id = `redemp:${ulid()}`;

  const [redemption] = await db
    .insert(couponRedemption)
    .values({ id, couponId: coupon.id, paymentId, courseId })
    .returning();

  return redemption;
}
