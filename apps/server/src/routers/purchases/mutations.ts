import { getPurchaseById } from "./queries.js";
import { Polar } from "@polar-sh/sdk";
import config from "~/config.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routers:purchases:mutations" });

// Define RefundReason locally to avoid ESLint import resolution issues with SDK sub-paths
export type RefundReason =
  | "duplicate"
  | "fraudulent"
  | "customer_request"
  | "service_disruption"
  | "satisfaction_guarantee"
  | "dispute_prevention"
  | "other";

const polarClient = new Polar({
  accessToken: config.POLAR_ACCESS_TOKEN,
  server: config.NODE_ENV === "production" ? "production" : "sandbox",
});

export interface RefundResult {
  success: boolean;
  refundId: string;
  orderId: string;
  createdAt: string;
  reason: string;
  amount: number;
  currency: string;
}

export async function refundOrder({
  orderId,
  reason = "customer_request",
  comment,
}: {
  orderId: string;
  reason?: RefundReason;
  comment?: string;
}): Promise<RefundResult> {
  // Check if access token is configured
  if (!config.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  try {
    // First get the order to know the amount
    const order = await getPurchaseById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Create refund using the refunds API
    const refund = await polarClient.refunds.create({
      orderId,
      reason,
      amount: order.totalAmount, // Full refund
      comment: comment ?? undefined,
      revokeBenefits: true, // Revoke benefits on refund
    });

    if (!refund) {
      throw new Error(`Failed to create refund for order ${orderId}`);
    }

    log.info(`Refunded order ${orderId} successfully`);

    return {
      success: true,
      refundId: refund.id,
      orderId: refund.orderId,
      createdAt: refund.createdAt.toISOString(),
      reason: refund.reason,
      amount: refund.amount,
      currency: refund.currency,
    };
  } catch (err) {
    // Provide clearer error message for connection issues
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("fetch failed")
    ) {
      log.error("Polar API unreachable, cannot process refund");
      throw new Error(
        "Polar API is currently unreachable. Please try again later.",
      );
    }
    log.error(err, `Failed to refund order ${orderId}`);
    throw err;
  }
}
