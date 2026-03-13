import { Polar } from "@polar-sh/sdk";
import config from "~/config.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routers:purchases:queries" });

const polarClient = new Polar({
  accessToken: config.POLAR_ACCESS_TOKEN,
  server: config.NODE_ENV === "production" ? "production" : "sandbox",
});

// Define types locally to avoid ESLint import resolution issues with SDK sub-paths
export type OrderStatus = string;
export type OrderBillingReason = string;

// Simplified order type for API response (serializable)
export interface PolarOrderResponse {
  id: string;
  createdAt: string;
  modifiedAt: string | null;
  status: OrderStatus;
  paid: boolean;
  totalAmount: number;
  refundedAmount: number;
  taxAmount: number;
  currency: string;
  billingReason: OrderBillingReason;
  customerId: string;
  productId: string | null;
  checkoutId: string | null;
  userId: string | null;
  invoiceNumber: string;
  description: string;
  customer: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    avatarUrl: string;
    organizationId: string;
  };
  product: {
    id: string;
    name: string;
    description: string | null;
    isRecurring: boolean;
    isArchived: boolean;
  } | null;
}

export type AllPurchases = PolarOrderResponse[];

type PolarOrder = Awaited<ReturnType<typeof polarClient.orders.get>>;

function mapOrderToResponse(order: PolarOrder): PolarOrderResponse {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    modifiedAt: order.modifiedAt?.toISOString() ?? null,
    status: order.status,
    paid: order.paid,
    totalAmount: order.totalAmount,
    refundedAmount: order.refundedAmount,
    taxAmount: order.taxAmount,
    currency: order.currency,
    billingReason: order.billingReason,
    customerId: order.customerId,
    productId: order.productId,
    checkoutId: order.checkoutId,
    userId: null,
    invoiceNumber: order.invoiceNumber,
    description: order.description,
    customer: {
      id: order.customer.id,
      email: order.customer.email,
      emailVerified: order.customer.emailVerified,
      name: order.customer.name,
      avatarUrl: order.customer.avatarUrl,
      organizationId: order.customer.organizationId,
    },
    product: order.product
      ? {
          id: order.product.id,
          name: order.product.name,
          description: order.product.description,
          isRecurring: order.product.isRecurring,
          isArchived: order.product.isArchived,
        }
      : null,
  };
}

export async function getAllPurchases(): Promise<AllPurchases> {
  // Skip API call if no access token is configured
  if (!config.POLAR_ACCESS_TOKEN) {
    log.warn(
      "POLAR_ACCESS_TOKEN not configured, returning empty purchases list",
    );
    return [];
  }

  try {
    const orders: PolarOrderResponse[] = [];

    // Fetch all orders using pagination
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await polarClient.orders.list({
        page,
        limit,
      });

      if (response.result.items.length > 0) {
        orders.push(...response.result.items.map(mapOrderToResponse));
        page++;
        hasMore = response.result.items.length === limit;
      } else {
        hasMore = false;
      }
    }

    log.info(`Fetched ${orders.length} orders from Polar`);
    return orders;
  } catch (err) {
    // Return empty array on connection errors (e.g., sandbox API unreachable)
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("fetch failed")
    ) {
      log.warn("Polar API unreachable, returning empty purchases list");
      return [];
    }
    log.error(err, "Failed to fetch orders from Polar");
    throw err;
  }
}

export async function getPurchaseById(
  orderId: string,
): Promise<PolarOrderResponse | null> {
  // Skip API call if no access token is configured
  if (!config.POLAR_ACCESS_TOKEN) {
    log.warn("POLAR_ACCESS_TOKEN not configured");
    return null;
  }

  try {
    const order = await polarClient.orders.get({ id: orderId });
    return mapOrderToResponse(order);
  } catch (err) {
    // Return null on connection errors (e.g., sandbox API unreachable)
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("fetch failed")
    ) {
      log.warn(`Polar API unreachable, cannot fetch order ${orderId}`);
      return null;
    }
    log.error(err, `Failed to fetch order ${orderId} from Polar`);
    return null;
  }
}
