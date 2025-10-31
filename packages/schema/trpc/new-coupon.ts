import { prefixedUlid } from "../base/prefixed-ulid.ts";
import z from "zod";

export const newCouponSchema = z.object({
  active: z.boolean(),
  code: z.string(),
  courseId: prefixedUlid.nullable(),
  currentRedemptions: z.number().optional(),
  description: z.string().nullable(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number(),
  redemptionLimit: z.number(),
  validFrom: z.date(),
  validTo: z.date().nullable(),
});
