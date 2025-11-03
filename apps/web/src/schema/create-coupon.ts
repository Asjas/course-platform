import * as z from "zod";

export const createCouponSchema = z.object({
  active: z.boolean(),
  code: z.string(),
  courseId: z.string().nullable(),
  description: z.string().nullable(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number(),
  redemptionLimit: z.number(),
  validFrom: z.date(),
  validTo: z.date().nullable(),
});
