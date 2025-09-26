import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { mySchema } from "~/db/schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { courseWishlist } from "~/db/schema/course.js";
import { enrollment } from "~/db/schema/enrollment.js";
import { platformAnnouncement } from "~/db/schema/platform.js";
import { courseProgress } from "~/db/schema/progress.js";
import { payment } from "~/db/schema/purchase.js";
import { supportTicket } from "~/db/schema/support.js";
import { teamLicense } from "~/db/schema/teamLicense.js";

// Enums
export const members = mySchema.enum("members", [
  "member",
  "admin",
  "owner",
  "ghost",
]);

// Tables
export const user = mySchema.table(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    username: text(),
    displayUsername: text(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    role: members().default("member").notNull(),
    banned: boolean().default(false),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    isAnonymous: boolean(),
    metadata: text(),
    ...timestamps,
  },
  (table) => [
    index("user_name_idx").on(table.name),
    index("user_username_idx").on(table.username),
    index("user_email_idx").on(table.email),
    index("user_role_idx").on(table.role),
    index("user_banned_idx").on(table.banned),
    index("user_email_verified_idx").on(table.emailVerified),
    index("user_created_at_idx").on(table.createdAt),
    index("user_updated_at_idx").on(table.updatedAt),
  ],
);

export const account = mySchema.table(
  "account",
  {
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
  },
  (table) => [
    index("account_account_id_idx").on(table.accountId),
    index("account_provider_id_idx").on(table.providerId),
    index("account_access_token_idx").on(table.accessToken),
    index("account_refresh_token_idx").on(table.refreshToken),
    index("account_id_token_idx").on(table.idToken),
    index("account_user_id_idx").on(table.userId),
    index("account_refresh_token_expires_at_idx").on(
      table.refreshTokenExpiresAt,
    ),
    index("account_access_token_expires_at_idx").on(table.accessTokenExpiresAt),
    uniqueIndex("account_provider_user_unique_idx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

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
  (table) => [
    index("session_token_idx").on(table.token),
    index("session_user_idx").on(table.userId),
    index("session_ip_address_idx").on(table.ipAddress),
    index("session_user_agent_idx").on(table.userAgent),
    index("session_expires_at_idx").on(table.expiresAt),
    index("session_impersonated_by_idx").on(table.impersonatedBy),
  ],
);

export const verification = mySchema.table(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_value_idx").on(table.value),
    index("verification_expires_at_idx").on(table.expiresAt),
  ],
);

export const organization = mySchema.table(
  "organization",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    slug: text().unique(),
    logo: text(),
    metadata: text(),
    ...timestamps,
  },
  (table) => [
    index("organization_name_idx").on(table.name),
    index("organization_slug_idx").on(table.slug),
    index("organization_created_at_idx").on(table.createdAt),
    index("organization_updated_at_idx").on(table.updatedAt),
  ],
);

export const member = mySchema.table(
  "member",
  {
    id: text().primaryKey(),
    role: members().default("member").notNull(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("member_organization_idx").on(table.organizationId),
    index("member_user_idx").on(table.userId),
    index("member_role_idx").on(table.role),
    uniqueIndex("member_organization_user_unique_idx").on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export const invitation = mySchema.table(
  "invitation",
  {
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
  },
  (table) => [
    index("invitation_email_idx").on(table.email),
    index("invitation_status_idx").on(table.status),
    index("invitation_organization_idx").on(table.organizationId),
    index("invitation_inviter_idx").on(table.inviterId),
    uniqueIndex("invitation_organization_email_unique_idx").on(
      table.organizationId,
      table.email,
    ),
  ],
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  enrollments: many(enrollment),
  progress: many(courseProgress),
  payments: many(payment),
  tickets: many(supportTicket),
  teamLicenses: many(teamLicense),
  wishlists: many(courseWishlist),
  announcements: many(platformAnnouncement),
}));
