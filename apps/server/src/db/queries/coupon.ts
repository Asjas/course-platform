import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:coupon" });

// All coupons are admin only
// This query is used in the admin dashboard
export async function getAllCoupons() {
  const preparedStatement = db.query.coupon
    .findMany({ with: { redemptions: true } })
    .prepare("getAllCoupons");

  try {
    const coupons = await preparedStatement.execute();

    return { coupons, count: coupons.length };
  } catch (err) {
    log.error(err, "Failed to get all coupons");
    throw err;
  }
}

// Individual coupons are accessible by all users
export async function getCouponById(id: string) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.id, sql.placeholder("id")),
      with: { redemptions: true },
    })
    .prepare("getCouponById");

  try {
    const coupon = await preparedStatement.execute({ id });

    return coupon ?? null;
  } catch (err) {
    log.error(err, `Failed to get coupon with id ${id}`);
    throw err;
  }
}

// Individual coupons are accessible by all users
export async function getCouponByCode(code: string) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.code, sql.placeholder("code")),
      with: { redemptions: true },
    })
    .prepare("getCouponByCode");

  try {
    const coupon = await preparedStatement.execute({ code });

    return coupon ?? null;
  } catch (err) {
    log.error(err, `Failed to get coupon with code ${code}`);
    throw err;
  }
}
