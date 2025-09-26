import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { ONE_WEEK } from "~/lib/constants.js";
import { redis } from "~/lib/redis.js";

// All invoices are admin only
// This query is used in the admin dashboard
export async function getAllInvoices() {
  const preparedStatement = db.query.invoice
    .findMany({ with: { payment: true } })
    .prepare("getAllInvoices");

  const invoices = await preparedStatement.execute();

  return { invoices, count: invoices.length };
}

// All invoices are admin only
// This query is used in the admin dashboard
export async function getAllInvoicesCached() {
  const cacheKey = `invoices:all`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const invoices = await getAllInvoices();
  if (invoices.count > 0) {
    await redis.setex(cacheKey, JSON.stringify(invoices), ONE_WEEK);
  }

  return invoices;
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceById(id: string) {
  const preparedStatement = db.query.invoice
    .findFirst({
      where: (invoice) => eq(invoice.id, sql.placeholder("id")),
      with: { payment: true },
    })
    .prepare("getInvoiceById");

  const invoice = await preparedStatement.execute({ id });

  return invoice ?? null;
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceByIdCached(id: string) {
  const cacheKey = `invoice:id:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const invoice = await getInvoiceById(id);
  if (invoice) {
    await redis.setex(cacheKey, JSON.stringify(invoice), ONE_WEEK);
  }

  return invoice;
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceByNumber(number: string) {
  const preparedStatement = db.query.invoice
    .findFirst({
      where: (invoice) => eq(invoice.invoiceNumber, sql.placeholder("number")),
      with: { payment: true },
    })
    .prepare("getInvoiceByNumber");

  const invoice = await preparedStatement.execute({ number });

  return invoice ?? null;
}

// Individual invoices are accessible by admin and the user themselves
export async function getInvoiceByNumberCached(number: string) {
  const cacheKey = `invoice:number:${number}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const invoice = await getInvoiceByNumber(number);
  if (invoice) {
    await redis.setex(cacheKey, JSON.stringify(invoice), ONE_WEEK);
  }

  return invoice;
}
