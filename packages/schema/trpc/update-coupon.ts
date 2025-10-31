import { prefixedUlid } from "../base/prefixed-ulid.ts";
import z from "zod";

export const updateCouponSchema = z.object({
  id: prefixedUlid,
  active: z.boolean().optional(),
  code: z.string(),
  courseId: prefixedUlid.nullable(),
  currentRedemptions: z.number().optional(),
  description: z.string().nullable(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number(),
  maxRedemptions: z.number().nullable(),
  validFrom: z.date(),
  validTo: z.date().nullable(),
});
