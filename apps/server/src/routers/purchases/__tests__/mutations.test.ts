import { refundOrder } from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockRefundsCreate } = vi.hoisted(() => ({
  mockRefundsCreate: vi.fn(),
}));

vi.mock("@polar-sh/sdk", () => ({
  Polar: vi.fn().mockImplementation(function () {
    return {
      refunds: {
        create: mockRefundsCreate,
      },
    };
  }),
}));

vi.mock("~/config.js", () => ({
  default: {
    POLAR_ACCESS_TOKEN: "test-token",
    NODE_ENV: "test",
  },
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock("../queries.js", () => ({
  getPurchaseById: vi.fn().mockResolvedValue(null),
}));

describe("refundOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof refundOrder).toBe("function");
  });

  test("throws when order is not found", async () => {
    await expect(refundOrder({ orderId: "order:nonexistent" })).rejects.toThrow(
      "Order order:nonexistent not found",
    );
  });

  test("throws on ENOTFOUND error", async () => {
    const queries = await import("../queries.js");
    vi.mocked(queries.getPurchaseById).mockResolvedValueOnce({
      id: "order:1",
      totalAmount: 9900,
    } as never);

    mockRefundsCreate.mockRejectedValue(new Error("ENOTFOUND"));

    await expect(refundOrder({ orderId: "order:1" })).rejects.toThrow(
      "Polar API is currently unreachable",
    );
  });

  test("returns refund result on success", async () => {
    const queries = await import("../queries.js");
    vi.mocked(queries.getPurchaseById).mockResolvedValueOnce({
      id: "order:1",
      totalAmount: 9900,
    } as never);

    mockRefundsCreate.mockResolvedValue({
      id: "refund:1",
      orderId: "order:1",
      createdAt: new Date("2025-01-15"),
      reason: "customer_request",
      amount: 9900,
      currency: "usd",
    });

    const result = await refundOrder({ orderId: "order:1" });

    expect(result.success).toBe(true);
    expect(result.refundId).toBe("refund:1");
    expect(result.orderId).toBe("order:1");
    expect(result.amount).toBe(9900);
  });
});
