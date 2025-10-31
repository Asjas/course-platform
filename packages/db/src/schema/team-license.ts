import { mySchema } from "../my-schema";
import { timestamps } from "./columns.helpers";
import { course } from "./course";
import { invoice, payment } from "./purchase";
import { organization, user } from "./user";
import { relations, sql } from "drizzle-orm";
import { check, index, smallint, text, timestamp } from "drizzle-orm/pg-core";

export const seatStatus = mySchema.enum("seat_status", [
  "pending",
  "claimed",
  "revoked",
]);

export const teamLicense = mySchema.table(
  "team_license",
  {
    id: text().primaryKey(),
    totalSeats: smallint().notNull(),
    claimedSeats: smallint().default(0).notNull(),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    purchaserId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
    organizationId: text().references(() => organization.id, {
      onDelete: "set null",
    }),
    invoiceId: text()
      .notNull()
      .references(() => invoice.id, {
        onDelete: "cascade",
      }),
    paymentId: text()
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("team_license_course_idx").on(table.courseId),
    index("team_license_purchaser_idx").on(table.purchaserId),
    index("team_license_organization_idx").on(table.organizationId),
    index("team_license_payment_idx").on(table.paymentId),
    check(
      "team_license_total_seats_check",
      sql`${table.totalSeats} IN (10, 15, 20, 25, 30)`,
    ),
    check(
      "team_license_claimed_seats_check",
      sql`${table.claimedSeats} >= 0 AND ${table.claimedSeats} <= ${table.totalSeats}`,
    ),
  ],
);

export const teamLicenseInvite = mySchema.table(
  "team_license_invite",
  {
    id: text().primaryKey(),
    status: seatStatus().default("pending").notNull(),
    licenseId: text()
      .notNull()
      .references(() => teamLicense.id, { onDelete: "cascade" }),
    inviteEmail: text().notNull(),
    inviteCode: text().notNull().unique(),
    invitedByUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: "set default" })
      .default("ghost"),
    acceptedByUserId: text().references(() => user.id, {
      onDelete: "cascade",
    }),
    revokedByUserId: text()
      .references(() => user.id, {
        onDelete: "set default",
      })
      .default("ghost"),
    expiresAt: timestamp({ withTimezone: true }),
    acceptedAt: timestamp({ withTimezone: true }),
    revokedAt: timestamp({ withTimezone: true }),
    lastSentAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("team_license_invite_license_idx").on(table.licenseId),
    index("team_license_invite_email_idx").on(table.inviteEmail),
    index("team_license_invite_status_idx").on(table.status),
    check(
      "team_license_invite_status_check",
      sql`${table.status} IN ('pending', 'claimed', 'revoked')`,
    ),
    check(
      "team_license_invite_acceptance_check",
      sql`(${table.status} = 'claimed' AND ${table.acceptedByUserId} IS NOT NULL)
        OR (${table.status} <> 'claimed' AND ${table.acceptedByUserId} IS NULL)`,
    ),
    check(
      "team_license_invite_revocation_check",
      sql`(${table.status} = 'revoked' AND ${table.revokedByUserId} IS NOT NULL AND ${table.revokedAt} IS NOT NULL)
        OR (${table.status} <> 'revoked' AND ${table.revokedByUserId} IS NULL AND ${table.revokedAt} IS NULL)`,
    ),
    check(
      "team_license_invite_expires_at_check",
      sql`${table.expiresAt} IS NULL OR ${table.expiresAt} > ${table.createdAt}`,
    ),
    check(
      "team_license_invite_last_sent_at_check",
      sql`${table.lastSentAt} IS NULL OR ${table.lastSentAt} >= ${table.createdAt}`,
    ),
    check(
      "team_license_invite_invite_code_check",
      sql`${table.inviteCode} <> ''`,
    ),
  ],
);

// Relations
export const teamLicenseRelations = relations(teamLicense, ({ many, one }) => ({
  course: one(course, {
    fields: [teamLicense.courseId],
    references: [course.id],
    relationName: "team_license_course",
  }),
  purchaser: one(user, {
    fields: [teamLicense.purchaserId],
    references: [user.id],
    relationName: "team_license_purchaser",
  }),
  organization: one(organization, {
    fields: [teamLicense.organizationId],
    references: [organization.id],
    relationName: "team_license_organization",
  }),
  invoice: one(invoice, {
    fields: [teamLicense.invoiceId],
    references: [invoice.id],
    relationName: "team_license_invoice",
  }),
  payment: one(payment, {
    fields: [teamLicense.paymentId],
    references: [payment.id],
    relationName: "team_license_payment",
  }),
  invites: many(teamLicenseInvite),
}));

export const teamLicenseInviteRelations = relations(
  teamLicenseInvite,
  ({ one }) => ({
    license: one(teamLicense, {
      fields: [teamLicenseInvite.licenseId],
      references: [teamLicense.id],
      relationName: "team_license_invite_license",
    }),
    invitedBy: one(user, {
      fields: [teamLicenseInvite.invitedByUserId],
      references: [user.id],
      relationName: "team_license_invite_invited_by",
    }),
    acceptedBy: one(user, {
      fields: [teamLicenseInvite.acceptedByUserId],
      references: [user.id],
      relationName: "team_license_invite_accepted_by",
    }),
    revokedBy: one(user, {
      fields: [teamLicenseInvite.revokedByUserId],
      references: [user.id],
      relationName: "team_license_invite_revoked_by",
    }),
  }),
);
