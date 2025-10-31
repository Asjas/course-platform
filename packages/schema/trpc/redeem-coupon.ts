import { prefixedUlid } from "../base/prefixed-ulid.ts";
import z from "zod";

export const redeemCouponSchema = z.object({
  couponCode: z.string(),
  paymentId: prefixedUlid,
  courseId: prefixedUlid,
});
