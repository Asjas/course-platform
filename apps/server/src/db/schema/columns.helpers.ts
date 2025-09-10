import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
};
