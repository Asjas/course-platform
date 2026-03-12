import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";

export type AllEarlySignups = Awaited<ReturnType<typeof getAllEarlySignups>>;
export type EarlySignupById = Awaited<ReturnType<typeof getEarlySignupById>>;

const preparedGetAllEarlySignups = db.query.earlySignup
  .findMany({
    orderBy: (row) => [desc(row.createdAt)],
  })
  .prepare("getAllEarlySignups");

const preparedGetEarlySignupById = db.query.earlySignup
  .findFirst({
    where: (row) => eq(row.id, sql.placeholder("id")),
  })
  .prepare("getEarlySignupById");

export async function getAllEarlySignups() {
  return preparedGetAllEarlySignups.execute();
}

export async function getEarlySignupById({ id }: { id: string }) {
  return preparedGetEarlySignupById.execute({ id }) ?? null;
}
