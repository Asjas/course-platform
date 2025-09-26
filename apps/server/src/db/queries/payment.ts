import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All payments are admin only
// This query is used in the admin dashboard
export async function getAllPayments() {
  const preparedStatement = db.query.payment
    .findMany({ with: { user: true, invoice: true } })
    .prepare("getAllPayments");

  const payments = await preparedStatement.execute();

  return { payments, count: payments.length };
}

// All payments are admin only
// This query is used in the admin dashboard
export async function getAllPaymentsCached() {
  const cacheKey = `payments:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const payments = await getAllPayments();
  if (payments.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(payments), ONE_WEEK);
  }

  return payments;
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentById(id: string) {
  const preparedStatement = db.query.payment
    .findFirst({
      where: (payment) => eq(payment.id, sql.placeholder("id")),
      with: { user: true, invoice: true },
    })
    .prepare("getPaymentById");

  const payment = await preparedStatement.execute({ id });

  return payment ?? null;
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentByIdCached(id: string) {
  const cacheKey = `payment:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const payment = await getPaymentById(id);
  if (payment) {
    await redis.setex(cacheKey, JSON.stringify(payment), ONE_WEEK);
  }

  return payment;
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentByTransactionId(transactionId: string) {
  const preparedStatement = db.query.payment
    .findFirst({
      where: (payment) =>
        eq(payment.transactionId, sql.placeholder("transactionId")),
      with: { user: true, invoice: true },
    })
    .prepare("getPaymentByTransactionId");

  const payment = await preparedStatement.execute({ transactionId });

  return payment ?? null;
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentByTransactionIdCached(transactionId: string) {
  const cacheKey = `payment:transactionId:${transactionId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const payment = await getPaymentByTransactionId(transactionId);
  if (payment) {
    await redis.setex(cacheKey, JSON.stringify(payment), ONE_WEEK);
  }

  return payment;
}
