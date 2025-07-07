import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers";

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text(),
  username: text().notNull().unique(),
  displayUsername: text(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  role: text().default("user").notNull(),
  banned: boolean(),
  banReason: text(),
  banExpires: timestamp(),
  ...timestamps,
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  impersonatedBy: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp().notNull(),
  ...timestamps,
});

export const account = pgTable("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  ...timestamps,
});
