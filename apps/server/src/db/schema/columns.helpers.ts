import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
};
