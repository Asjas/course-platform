import * as z from "zod";

// Valid refund reasons from Polar SDK
export const refundReasonOptions = [
  { value: "customer_request", label: "Customer Request" },
  { value: "duplicate", label: "Duplicate Order" },
  { value: "fraudulent", label: "Fraudulent" },
  { value: "service_disruption", label: "Service Disruption" },
  { value: "satisfaction_guarantee", label: "Satisfaction Guarantee" },
  { value: "dispute_prevention", label: "Dispute Prevention" },
  { value: "other", label: "Other" },
] as const;

export const refundReasonSchema = z.enum([
  "duplicate",
  "fraudulent",
  "customer_request",
  "service_disruption",
  "satisfaction_guarantee",
  "dispute_prevention",
  "other",
]);

export type RefundReason = z.infer<typeof refundReasonSchema>;

export const refundPurchaseSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: refundReasonSchema,
  comment: z.string(),
});

export type RefundPurchaseFormData = z.infer<typeof refundPurchaseSchema>;
