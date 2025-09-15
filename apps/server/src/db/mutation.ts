import { db } from "~/db/index.js";
import { user } from "~/db/schema/user.js";

type NewUser = typeof user.$inferInsert;

export const insertUser = async (newUser: NewUser) => {
  return db.insert(user).values(newUser);
};
