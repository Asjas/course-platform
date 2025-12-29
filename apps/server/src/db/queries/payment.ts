import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:payment" });

// Module-scoped prepared statements
const preparedGetAllPayments = db.query.payment
  .findMany({ with: { user: true, invoice: true } })
  .prepare("getAllPayments");

const preparedGetPaymentById = db.query.payment
  .findFirst({
    where: (payment) => eq(payment.id, sql.placeholder("id")),
    with: { user: true, invoice: true },
  })
  .prepare("getPaymentById");

const preparedGetPaymentByTransactionId = db.query.payment
  .findFirst({
    where: (payment) =>
      eq(payment.transactionId, sql.placeholder("transactionId")),
    with: { user: true, invoice: true },
  })
  .prepare("getPaymentByTransactionId");

// All payments are admin only
// This query is used in the admin dashboard
export async function getAllPayments() {
  try {
    const payments = await preparedGetAllPayments.execute();

    return { payments, count: payments.length };
  } catch (err) {
    log.error(err, "Failed to get all payments");
    throw err;
  }
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentById(id: string) {
  try {
    const payment = await preparedGetPaymentById.execute({ id });

    return payment ?? null;
  } catch (err) {
    log.error(err, `Failed to get payment with id ${id}`);
    throw err;
  }
}

// Individual payments are accessible by admin and the user themselves
export async function getPaymentByTransactionId(transactionId: string) {
  try {
    const payment = await preparedGetPaymentByTransactionId.execute({
      transactionId,
    });

    return payment ?? null;
  } catch (err) {
    log.error(
      err,
      `Failed to get payment with transaction id ${transactionId}`,
    );
    throw err;
  }
}
