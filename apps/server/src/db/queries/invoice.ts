import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "db:queries:invoice" });

// Module-scoped prepared statements
const preparedGetAllInvoices = db.query.invoice
  .findMany({ with: { payment: true } })
  .prepare("getAllInvoices");

const preparedGetInvoiceById = db.query.invoice
  .findFirst({
    where: (invoice) => eq(invoice.id, sql.placeholder("id")),
    with: { payment: true },
  })
  .prepare("getInvoiceById");

const preparedGetInvoiceByNumber = db.query.invoice
  .findFirst({
    where: (invoice) => eq(invoice.invoiceNumber, sql.placeholder("number")),
    with: { payment: true },
  })
  .prepare("getInvoiceByNumber");

// All invoices are admin only
// This query is used in the admin dashboard
export async function getAllInvoices() {
  try {
    const invoices = await preparedGetAllInvoices.execute();

    return { invoices, count: invoices.length };
  } catch (err) {
    log.error(err, "Failed to get all invoices");
    throw err;
  }
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceById(id: string) {
  try {
    const invoice = await preparedGetInvoiceById.execute({ id });

    return invoice ?? null;
  } catch (err) {
    log.error(err, `Failed to get invoice with id ${id}`);
    throw err;
  }
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceByNumber(number: string) {
  try {
    const invoice = await preparedGetInvoiceByNumber.execute({ number });

    return invoice ?? null;
  } catch (err) {
    log.error(err, `Failed to get invoice with number ${number}`);
    throw err;
  }
}
