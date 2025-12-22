import * as z from "zod";

export const editCouponSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  code: z.string().min(1, "Code is required"),
  courseId: z.string().nullable(),
  description: z.string().nullable(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z
    .number()
    .positive("Discount value must be greater than 0")
    .refine((val) => val <= 100, "Percentage discount cannot exceed 100%"),
  redemptionLimit: z.number().nullable(),
  validFrom: z.date(),
  validUntil: z.date().nullable(),
});

export type EditCouponFormData = z.infer<typeof editCouponSchema>;
