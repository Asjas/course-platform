import { db } from "~/db/index.js";

export type AllEarlySignups = Awaited<ReturnType<typeof getAllEarlySignups>>;

const preparedGetAllEarlySignups = db.query.earlySignup
  .findMany()
  .prepare("getAllEarlySignups");

export async function getAllEarlySignups() {
  return preparedGetAllEarlySignups.execute();
}
