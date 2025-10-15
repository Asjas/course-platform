import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import { coupon } from "~/db/schema/coupon.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:mutations:coupons" });

export type Coupon = typeof coupon.$inferSelect;
export type NewCoupon = Omit<typeof coupon.$inferInsert, "id">;

export async function insertCoupon({ newCoupon }: { newCoupon: NewCoupon }) {
  const id = `coup:${ulid()}`;
  const newCouponWithId = { id, ...newCoupon };

  try {
    const result = await db.insert(coupon).values(newCouponWithId).returning();

    return result[0];
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to insert coupon");
    }

    throw err;
  }
}

export async function updateCouponById({
  couponId,
  updates,
}: {
  couponId: string;
  updates: Partial<Coupon>;
}) {
  try {
    const result = await db
      .update(coupon)
      .set({ ...updates })
      .where(eq(coupon.id, couponId))
      .returning();

    return result[0];
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to update coupon with id ${couponId}`);
    }

    throw err;
  }
}

export async function updateCouponByCode({
  couponCode,
  updates,
}: {
  couponCode: string;
  updates: Partial<Coupon>;
}) {
  try {
    const result = await db
      .update(coupon)
      .set({ ...updates })
      .where(eq(coupon.code, couponCode))
      .returning();

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to update coupon with code ${couponCode}`);
    }

    throw err;
  }
}

export async function deleteCouponById({ couponId }: { couponId: string }) {
  try {
    const result = db
      .delete(coupon)
      .where(eq(coupon.id, couponId))
      .returning({ id: coupon.id });

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to delete coupon with id ${couponId}`);
    }

    throw err;
  }
}

export async function deleteCouponByCode({
  couponCode,
}: {
  couponCode: string;
}) {
  try {
    const result = db
      .delete(coupon)
      .where(eq(coupon.code, couponCode))
      .returning({ id: coupon.id });

    return result;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to delete coupon with code ${couponCode}`);
    }

    throw err;
  }
}
