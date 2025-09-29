import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { mySchema } from "~/db/schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course } from "~/db/schema/course.js";
import { invoice, payment } from "~/db/schema/purchase.js";
import { teamLicense, teamLicenseInvite } from "~/db/schema/teamLicense.js";
import { user } from "~/db/schema/user.js";

// Enums
export const enrollmentType = mySchema.enum("course_enrollment_type", [
  "individual",
  "gift",
  "team",
]);

export const enrollmentSource = mySchema.enum("course_enrollment_source", [
  "direct",
  "gift",
  "team_invite",
]);

export const enrollmentStatus = mySchema.enum("course_enrollment_status", [
  "active",
  "cancelled",
  "refunded",
  "completed",
]);

// Tables
export const enrollment = mySchema.table(
  "enrollment",
  {
    id: text().primaryKey(),
    enrollmentType: enrollmentType().default("individual").notNull(),
    enrollmentSource: enrollmentSource().default("direct").notNull(),
    status: enrollmentStatus().default("active").notNull(),
    giftedByUserId: text()
      .references(() => user.id, {
        onDelete: "set default",
      })
      .default("ghost"),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    paymentId: text().references(() => payment.id, {
      onDelete: "cascade",
    }),
    invoiceId: text().references(() => invoice.id, {
      onDelete: "cascade",
    }),
    teamLicenseId: text().references(() => teamLicense.id, {
      onDelete: "cascade",
    }),
    teamInviteId: text().references(() => teamLicenseInvite.id, {
      onDelete: "cascade",
    }),
    giftedAt: timestamp({ withTimezone: true }),
    enrolledAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("enrollment_unique_idx").on(table.userId, table.courseId),
    index("enrollment_user_idx").on(table.userId),
    index("enrollment_course_idx").on(table.courseId),
    index("enrollment_payment_idx").on(table.paymentId),
    index("enrollment_invoice_idx").on(table.invoiceId),
    index("enrollment_gifter_idx").on(table.giftedByUserId),
    index("enrollment_team_license_idx").on(table.teamLicenseId),
    index("enrollment_team_invite_idx").on(table.teamInviteId),
    index("enrollment_status_idx").on(table.status),
    check(
      "enrollment_status_check",
      sql`${table.status} IN ('active', 'cancelled', 'refunded', 'completed')`,
    ),
    check(
      "enrollment_gifted_at_check",
      sql`${table.enrollmentType} = 'gift' OR (${table.enrollmentType} != 'gift' AND ${table.giftedAt} IS NULL)`,
    ),
    check(
      "enrollment_payment_invoice_check",
      sql`${table.enrollmentType} = 'individual' OR (${table.enrollmentType} != 'individual' AND ${table.paymentId} IS NULL AND ${table.invoiceId} IS NULL)`,
    ),
    check(
      "enrollment_team_license_check",
      sql`${table.enrollmentType} = 'team' OR (${table.enrollmentType} != 'team' AND ${table.teamLicenseId} IS NULL AND ${table.teamInviteId} IS NULL)`,
    ),
    check("enrollment_enrolled_at_check", sql`${table.enrolledAt} IS NOT NULL`),
  ],
);

// Relations
export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
    relationName: "enrollment_user",
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
    relationName: "enrollment_course",
  }),
}));
