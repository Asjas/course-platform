import { eq, sql } from "drizzle-orm";
import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

export const selectUserById = db
  .select()
  .from(user)
  .where(eq(user.id, sql.placeholder("id")))
  .prepare("selectUserById");
