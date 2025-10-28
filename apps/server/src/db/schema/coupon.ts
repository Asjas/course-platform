import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { course } from "~/db/schema/course.js";
import { payment } from "~/db/schema/purchase.js";
import { user } from "~/db/schema/user.js";

export type Coupon = typeof coupon.$inferSelect;
export type NewCoupon = Omit<typeof coupon.$inferInsert, "id">;

// Enums
export const discountType = mySchema.enum("discountType", [
  "percentage",
  "fixed",
]);

// Tables
export const coupon = mySchema.table(
  "coupon",
  {
    id: text().primaryKey(),
    code: text().notNull().unique(),
    description: text(),
    discountType: discountType().default("percentage").notNull(),
    discountValue: smallint().notNull(),
    redemptionLimit: smallint().default(1).notNull(),
    validFrom: timestamp({ withTimezone: true }).defaultNow().notNull(),
    validUntil: timestamp({ withTimezone: true }),
    active: boolean().default(true).notNull(),
    createdBy: text()
      .references(() => user.id, {
        onDelete: "set default",
      })
      .default("ghost"),
    courseId: text().references(() => course.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("coupon_code_idx").on(table.code),
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
    check("coupon_redemption_limit_check", sql`${table.redemptionLimit} > 0`),
    check(
      "coupon_percentage_discount_check",
      sql`(${table.discountType} != 'percentage') OR (${table.discountType} = 'percentage' AND ${table.discountValue} <= 100)`,
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
    paymentId: text()
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    redeemedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("coupon_redemption_unique_idx").on(
      table.couponId,
      table.paymentId,
      table.courseId,
    ),
  ],
);

// Relations
export const couponRelations = relations(coupon, ({ many }) => ({
  redemptions: many(couponRedemption),
}));

export const couponRedemptionRelations = relations(
  couponRedemption,
  ({ one }) => ({
    coupon: one(coupon, {
      fields: [couponRedemption.couponId],
      references: [coupon.id],
      relationName: "coupon_redemption_coupon",
    }),
    payment: one(payment, {
      fields: [couponRedemption.paymentId],
      references: [payment.id],
      relationName: "coupon_redemption_payment",
    }),
    course: one(course, {
      fields: [couponRedemption.courseId],
      references: [course.id],
      relationName: "coupon_redemption_course",
    }),
  }),
);
