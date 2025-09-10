import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { timestamps } from "~/db/schema/columns.helpers";

export const user = pgTable(
  "user",
  {
    id: uuid().primaryKey().unique().default(uuidv7()),
    name: text(),
    username: text().notNull().unique(),
    displayUsername: text(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    role: text().default("user").notNull(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    t.uniqueIndex("email_idx").on(table.email),
    t.uniqueIndex("username_idx").on(table.username),
  ],
);

export const session = pgTable("session", {
  id: uuid().primaryKey().unique().default(uuidv7()),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  impersonatedBy: text(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});

export const account = pgTable("account", {
  id: uuid().primaryKey().unique().default(uuidv7()),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp({ withTimezone: true }),
  refreshTokenExpiresAt: timestamp({ withTimezone: true }),
  scope: text(),
  password: text(),
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: uuid().primaryKey().unique().default(uuidv7()),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});
