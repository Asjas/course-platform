import { prefixedUlid } from "../base/prefixed-ulid.js";
import z from "zod";

export const redeemCouponSchema = z.object({
  couponCode: z.string(),
  paymentId: prefixedUlid,
  courseId: prefixedUlid,
});
