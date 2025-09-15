import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";

export const user = pgTable(
  "user",
  {
    id: uuid().primaryKey().unique(),
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
  id: uuid().primaryKey().unique(),
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
  id: uuid().primaryKey().unique(),
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
  id: uuid().primaryKey().unique(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});
