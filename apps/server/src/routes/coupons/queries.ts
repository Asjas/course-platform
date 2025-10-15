import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ routes: "db:queries:coupon" });

export async function getAllCoupons() {
  const preparedStatement = db.query.coupon
    .findMany({ with: { redemptions: true } })
    .prepare("getAllCoupons");

  try {
    const coupons = await preparedStatement.execute();

    return { coupons, count: coupons.length };
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, "Failed to get all coupons");
    }

    throw err;
  }
}

export async function getCouponById({ couponId }: { couponId: string }) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.id, sql.placeholder("couponId")),
      with: { redemptions: true },
    })
    .prepare("getCouponById");

  try {
    const coupon = await preparedStatement.execute({ couponId });

    return coupon ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get coupon with id ${couponId}`);
    }

    throw err;
  }
}

export async function getCouponByCode({ couponCode }: { couponCode: string }) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.code, sql.placeholder("couponCode")),
      with: { redemptions: true },
    })
    .prepare("getCouponByCode");

  try {
    const coupon = await preparedStatement.execute({ couponCode });

    return coupon ?? null;
  } catch (err) {
    if (err instanceof Error) {
      log.error(err, `Failed to get coupon with code ${couponCode}`);
    }

    throw err;
  }
}
