import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course } from "~/db/schema/course.js";
import { mySchema, user } from "~/db/schema/user.js";

export const couponType = mySchema.enum("coupon", ["percentage", "fixed"]);

export const coupon = mySchema.table(
  "coupon",
  {
    id: text().primaryKey(),
    code: text().notNull().unique(),
    description: text(),
    discountType: couponType().default("percentage").notNull(),
    discountValue: smallint().notNull(),
    currentRedemptions: integer().default(0).notNull(),
    redemptionLimit: integer().default(1).notNull(),
    validFrom: timestamp({ withTimezone: true }).defaultNow().notNull(),
    validUntil: timestamp({ withTimezone: true }),
    active: boolean().default(true).notNull(),
    createdBy: text()
      .references(() => user.id, {
        onDelete: "set default",
      })
      .default("ghost"),
    courseId: text().references(() => course.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    index("coupon_code_idx").on(table.code),
    index("coupon_course_idx").on(table.courseId),
    check("coupon_discount_value_check", sql`${table.discountValue} > 0`),
    check(
      "coupon_validity_check",
      sql`${table.validUntil} IS NULL OR ${table.validUntil} > ${table.validFrom}`,
    ),
    check(
      "coupon_discount_type_check",
      sql`${table.discountType} IN ('percentage', 'fixed')`,
    ),
    check("coupon_active_check", sql`${table.active} IN (true, false)`),
    check(
      "coupon_current_redemptions_check",
      sql`${table.currentRedemptions} >= 0`,
    ),
    check("coupon_redemption_limit_check", sql`${table.redemptionLimit} > 0`),
    check(
      "coupon_redemptions_limit_check",
      sql`${table.currentRedemptions} <= ${table.redemptionLimit}`,
    ),
    check(
      "coupon_percentage_discount_check",
      sql`(${table.discountType} != 'percentage') OR (${table.discountType} = 'percentage' AND ${table.discountValue} <= 100)`,
    ),
    check(
      "coupon_created_by_check",
      sql`${table.createdBy} IS NULL OR ${table.createdBy} IN (SELECT id FROM users)`,
    ),
    check(
      "coupon_course_check",
      sql`${table.courseId} IS NULL OR ${table.courseId} IN (SELECT id FROM course)`,
    ),
  ],
);

export const couponRedemption = mySchema.table(
  "coupon_redemption",
  {
    id: text().primaryKey(),
    couponId: text()
      .notNull()
      .references(() => coupon.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    redeemedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [
    index("coupon_redemption_course_idx").on(table.courseId),
    index("coupon_redemption_user_idx").on(table.userId),
    index("coupon_redemption_coupon_idx").on(table.couponId),
    uniqueIndex("coupon_redemption_unique_idx").on(
      table.couponId,
      table.userId,
      table.courseId,
    ),
  ],
);
