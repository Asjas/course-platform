import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "~/db/schema/columns.helpers.js";
import { coupon } from "~/db/schema/coupon.js";
import { course } from "~/db/schema/course.js";
import { mySchema, user } from "~/db/schema/user.js";

export const paidStatus = mySchema.enum("paid_status", ["paid", "refunded"]);

export const purchaseType = mySchema.enum("purchase_type", [
  "individual",
  "team",
]);

export const paymentStatus = mySchema.enum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const invoice = mySchema.table(
  "invoice",
  {
    id: text().primaryKey(),
    invoiceNumber: text().notNull().unique(),
    billingAddress: jsonb().notNull(),
    amount: smallint().notNull(),
    currency: text().default("USD").notNull(),
    isCouponApplied: boolean().default(false).notNull(),
    discountAmount: smallint().default(0).notNull(),
    taxRate: smallint().default(0).notNull(), // Percentage (e.g., 20 for 20%)
    taxAmount: smallint().default(0).notNull(),
    totalAmount: smallint().notNull(),
    status: paidStatus().default("paid").notNull(),
    issuedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp({ withTimezone: true }),
    refundedAt: timestamp({ withTimezone: true }),
    metadata: jsonb(),
    paymentId: text().references(() => payment.id, { onDelete: "cascade" }),
    couponId: text().references(() => coupon.id, {
      onDelete: "set null",
    }),
    userId: text().references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("invoice_payment_unique_idx").on(table.paymentId),
    index("invoice_coupon_idx").on(table.couponId),
    index("invoice_user_idx").on(table.userId),
    index("invoice_invoice_number_idx").on(table.invoiceNumber),
    check("invoice_amount_check", sql`${table.amount} > 0`),
    check("invoice_discount_amount_check", sql`${table.discountAmount} >= 0`),
    check("invoice_tax_rate_check", sql`${table.taxRate} >= 0`),
    check("invoice_tax_amount_check", sql`${table.taxAmount} >= 0`),
    check("invoice_total_amount_check", sql`${table.totalAmount} > 0`),
    check(
      "invoice_total_amount_consistency_check",
      sql`${table.totalAmount} = ${table.amount} - ${table.discountAmount} + ${table.taxAmount}`,
    ),
    check("invoice_status_check", sql`${table.status} IN ('paid', 'refunded')`),
    check(
      "invoice_paid_at_check",
      sql`${table.status} = 'paid' OR (${table.status} = 'refunded' AND ${table.paidAt} IS NOT NULL)`,
    ),
    check(
      "invoice_refunded_at_check",
      sql`${table.status} = 'refunded' OR (${table.status} = 'paid' AND ${table.refundedAt} IS NULL)`,
    ),
    check(
      "invoice_coupon_check",
      sql`${table.couponId} IS NULL OR ${table.couponId} IN (SELECT id FROM coupon)`,
    ),
    check(
      "invoice_user_check",
      sql`${table.userId} IS NULL OR ${table.userId} IN (SELECT id FROM users)`,
    ),
    check(
      "invoice_issued_at_check",
      sql`${table.paidAt} IS NULL OR ${table.issuedAt} <= ${table.paidAt}`,
    ),
    check(
      "invoice_refunded_date_check",
      sql`${table.refundedAt} IS NULL OR ${table.refundedAt} >= ${table.paidAt}`,
    ),
    check(
      "invoice_payment_check",
      sql`${table.paymentId} IS NULL OR ${table.paymentId} IN (SELECT id FROM payment)`,
    ),
  ],
);

export const payment = mySchema.table(
  "payment",
  {
    id: text().primaryKey(),
    amount: smallint().notNull(),
    currency: text().default("USD").notNull(),
    paymentProvider: text().notNull(),
    transactionId: text().notNull().unique(),
    paymentStatus: paymentStatus().default("pending").notNull(),
    paidAt: timestamp({ withTimezone: true }),
    purchaseType: purchaseType().default("individual").notNull(),
    bulkQuantity: smallint(),
    isCouponApplied: boolean().default(false).notNull(),
    discountAmount: smallint().default(0).notNull(),
    isGift: boolean().default(false).notNull(),
    giftRecipientEmail: text(),
    giftMessage: text(),
    giftRedeemToken: text(),
    giftRedeemUrl: text(),
    giftRedeemedAt: timestamp({ withTimezone: true }),
    giftExpiresAt: timestamp({ withTimezone: true }),
    metadata: jsonb(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    couponId: text().references(() => coupon.id, {
      onDelete: "set null",
    }),
    giftRecipientUserId: text().references(() => user.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("payment_user_idx").on(table.userId),
    index("payment_course_idx").on(table.courseId),
    index("payment_coupon_idx").on(table.couponId),
    index("payment_gift_recipient_user_idx").on(table.giftRecipientUserId),
    index("payment_purchase_type_idx").on(table.purchaseType),
    uniqueIndex("payment_redeem_token_idx").on(table.giftRedeemToken),
    uniqueIndex("payment_redeem_url_idx").on(table.giftRedeemUrl),
    check("payment_amount_check", sql`${table.amount} > 0`),
    check(
      "payment_purchase_type_check",
      sql`${table.purchaseType} IN ('individual', 'team')`,
    ),
    check(
      "payment_bulk_quantity_required_check",
      sql`(
        ${table.purchaseType} = 'team'
        AND ${table.bulkQuantity} IN (10, 15, 20, 25, 30, 35, 40)
      ) OR (
        ${table.purchaseType} <> 'team'
        AND ${table.bulkQuantity} IS NULL
      )`,
    ),
    check(
      "payment_team_gift_mutual_exclusion_check",
      sql`(${table.purchaseType} <> 'team') OR (NOT ${table.isGift})`,
    ),
    check(
      "payment_gift_email_required_check",
      sql`(${table.isGift} = false AND ${table.giftRecipientEmail} IS NULL)
        OR (${table.isGift} = true AND ${table.giftRecipientEmail} IS NOT NULL)`,
    ),
    check(
      "payment_gift_redeem_token_check",
      sql`(${table.isGift} = false AND ${table.giftRedeemToken} IS NULL)
        OR (${table.isGift} = true AND ${table.giftRedeemToken} IS NOT NULL)`,
    ),
    check(
      "payment_gift_redeem_url_check",
      sql`(${table.isGift} = false AND ${table.giftRedeemUrl} IS NULL)
        OR (${table.isGift} = true AND ${table.giftRedeemUrl} IS NOT NULL)`,
    ),
    check(
      "payment_gift_redeem_date_check",
      sql`${table.giftRedeemedAt} IS NULL OR ${table.giftRedeemedAt} <= ${table.giftExpiresAt}`,
    ),
    check("payment_discount_amount_check", sql`${table.discountAmount} >= 0`),
    check(
      "payment_paid_at_check",
      sql`${table.paymentStatus} = 'completed' OR ${table.paidAt} IS NULL`,
    ),
    check(
      "payment_status_check",
      sql`${table.paymentStatus} IN ('pending', 'completed', 'failed', 'refunded')`,
    ),
    check(
      "payment_coupon_check",
      sql`${table.couponId} IS NULL OR ${table.couponId} IN (SELECT id FROM coupon)`,
    ),
    check(
      "payment_gift_recipient_user_check",
      sql`${table.giftRecipientUserId} IS NULL OR ${table.giftRecipientUserId} IN (SELECT id FROM users)`,
    ),
  ],
);
