import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All coupons are admin only
// This query is used in the admin dashboard
export async function getAllCoupons() {
  const preparedStatement = db.query.coupon
    .findMany({ with: { redemptions: true } })
    .prepare("getAllCoupons");

  const coupons = await preparedStatement.execute();

  return { coupons, count: coupons.length };
}

// All coupons are admin only
// This query is used in the admin dashboard
export async function getAllCouponsCached() {
  const cacheKey = `coupons:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const coupons = await getAllCoupons();
  if (coupons.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(coupons), ONE_WEEK);
  }

  return coupons;
}

// Individual coupons are accessible by all users
export async function getCouponById(id: string) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.id, sql.placeholder("id")),
      with: { redemptions: true },
    })
    .prepare("getCouponById");

  const coupon = await preparedStatement.execute({ id });

  return coupon ?? null;
}

// Individual coupons are accessible by all users
export async function getCouponByIdCached(id: string) {
  const cacheKey = `coupon:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const coupon = await getCouponById(id);
  if (coupon) {
    await redis.setex(cacheKey, JSON.stringify(coupon), ONE_WEEK);
  }

  return coupon;
}

// Individual coupons are accessible by all users
export async function getCouponByCode(code: string) {
  const preparedStatement = db.query.coupon
    .findFirst({
      where: (coupon) => eq(coupon.code, sql.placeholder("code")),
      with: { redemptions: true },
    })
    .prepare("getCouponByCode");

  const coupon = await preparedStatement.execute({ code });

  return coupon ?? null;
}

// Individual coupons are accessible by all users
export async function getCouponByCodeCached(code: string) {
  const cacheKey = `coupon:code:${code}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const coupon = await getCouponByCode(code);
  if (coupon) {
    await redis.setex(cacheKey, JSON.stringify(coupon), ONE_WEEK);
  }

  return coupon;
}
