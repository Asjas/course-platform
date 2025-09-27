import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { invoice } from "~/db/schema/purchase.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:mutations:invoice" });

export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;

export async function insertInvoice(newInvoice: NewInvoice) {
  try {
    const result = await db.insert(invoice).values(newInvoice).returning();

    return result;
  } catch (err) {
    log.error(err, "Failed to insert invoice");

    throw err;
  }
}

export async function updateInvoiceById(id: string, updates: Partial<Invoice>) {
  try {
    const result = await db
      .update(invoice)
      .set({ ...updates })
      .where(eq(invoice.id, id))
      .returning();

    return result;
  } catch (err) {
    log.error(err, `Failed to update invoice with id ${id}`);
    throw err;
  }
}

export async function deleteInvoiceById({ id }: Invoice) {
  try {
    const result = db
      .delete(invoice)
      .where(eq(invoice.id, id))
      .returning({ id: invoice.id });

    return result;
  } catch (err) {
    log.error(err, `Failed to delete invoice with id ${id}`);
    throw err;
  }
}
