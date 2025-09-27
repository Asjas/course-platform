import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { payment } from "~/db/schema/purchase.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:payment" });

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export async function insertPayment(newPayment: NewPayment) {
  try {
    const result = await db.insert(payment).values(newPayment).returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert payment");

    throw err;
  }
}

export async function updatePaymentById(id: string, updates: Partial<Payment>) {
  try {
    const result = await db
      .update(payment)
      .set({ ...updates })
      .where(eq(payment.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update payment with id ${id}`);
    throw err;
  }
}

export async function refundedPaymentById(
  id: string,
  updates: Partial<Payment>,
) {
  try {
    const result = await db
      .update(payment)
      .set({ ...updates })
      .where(eq(payment.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to refund payment with id ${id}`);
    throw err;
  }
}

export async function deletePaymentById({ id }: Payment) {
  try {
    const result = db
      .delete(payment)
      .where(eq(payment.id, id))
      .returning({ id: payment.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete payment with id ${id}`);
    throw err;
  }
}
