import { relations } from "drizzle-orm";
import { boolean, index, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { courseWishlist } from "~/db/schema/course.js";
import { enrollment } from "~/db/schema/enrollment.js";
import { platformAnnouncement } from "~/db/schema/platformAnnouncements.js";
import { courseProgress } from "~/db/schema/progress.js";
import { payment } from "~/db/schema/purchase.js";
import { supportTicket } from "~/db/schema/support-tickets.js";
import { teamLicense } from "~/db/schema/teamLicense.js";
import { userNotification } from "~/db/schema/userNotifications.js";

// Types
export type User = typeof user.$inferSelect;

// Enums
export const members = mySchema.enum("members", ["member", "admin"]);

// Tables
export const user = mySchema.table(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    username: text(),
    displayUsername: text(),
    color: text(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    role: members().default("member").notNull(),
    banned: boolean().default(false),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    metadata: text(),
    ...timestamps,
  },
  (table) => [index("user_email_idx").on(table.email)],
);

export const account = mySchema.table("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
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

export const session = mySchema.table(
  "session",
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    impersonatedBy: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("session_token_idx").on(table.token)],
);

export const verification = mySchema.table("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});

export const organization = mySchema.table("organization", {
  id: text().primaryKey(),
  name: text().notNull(),
  slug: text().unique(),
  logo: text(),
  metadata: text(),
  ...timestamps,
});

export const member = mySchema.table("member", {
  id: text().primaryKey(),
  role: members().default("member").notNull(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const invitation = mySchema.table("invitation", {
  id: text().primaryKey(),
  email: text().notNull(),
  role: members().default("member").notNull(),
  status: text().default("pending").notNull(),
  inviterId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  ...timestamps,
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session, { relationName: "session_user" }),
  enrollments: many(enrollment, { relationName: "enrollment_user" }),
  progress: many(courseProgress, { relationName: "course_progress_user" }),
  payments: many(payment, { relationName: "payment_user" }),
  tickets: many(supportTicket, { relationName: "support_ticket_user" }),
  teamLicenses: many(teamLicense),
  wishlists: many(courseWishlist),
  announcements: many(platformAnnouncement),
  notifications: many(userNotification, {
    relationName: "user_notification_user",
  }),
  actedNotifications: many(userNotification, {
    relationName: "user_notification_actor",
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: "session_user",
  }),
}));
