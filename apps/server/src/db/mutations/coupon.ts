import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { coupon } from "~/db/schema/coupon.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:coupon" });

export type Coupon = typeof coupon.$inferSelect;
export type NewCoupon = typeof coupon.$inferInsert;

export async function insertCoupon(newCoupon: NewCoupon) {
  try {
    const result = await db.insert(coupon).values(newCoupon).returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert coupon");

    throw err;
  }
}

export async function updateCouponById(id: string, updates: Partial<Coupon>) {
  try {
    const result = await db
      .update(coupon)
      .set({ ...updates })
      .where(eq(coupon.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update coupon with id ${id}`);
    throw err;
  }
}

export async function updateCouponByCode(
  code: string,
  updates: Partial<Coupon>,
) {
  try {
    const result = await db
      .update(coupon)
      .set({ ...updates })
      .where(eq(coupon.code, code))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update coupon with code ${code}`);
    throw err;
  }
}

export async function deleteCouponById({ id }: Coupon) {
  try {
    const result = db
      .delete(coupon)
      .where(eq(coupon.id, id))
      .returning({ id: coupon.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete coupon with id ${id}`);
    throw err;
  }
}

export async function deleteCouponByCode({ code }: Coupon) {
  try {
    const result = db
      .delete(coupon)
      .where(eq(coupon.code, code))
      .returning({ id: coupon.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete coupon with code ${code}`);
    throw err;
  }
}
