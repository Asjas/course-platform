import { purchasesRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockGetAllPurchases, mockGetPurchaseById, mockRefundOrder } =
  vi.hoisted(() => ({
    mockGetAllPurchases: vi.fn(),
    mockGetPurchaseById: vi.fn(),
    mockRefundOrder: vi.fn(),
  }));

vi.mock("~/routers/purchases/queries.js", () => ({
  getAllPurchases: mockGetAllPurchases,
  getPurchaseById: mockGetPurchaseById,
}));

vi.mock("~/routers/purchases/mutations.js", () => ({
  refundOrder: mockRefundOrder,
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  const log = {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };

  const caller = purchasesRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    request: { log },
  } as never);

  return { caller, log };
}

describe("purchasesRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll denies non-admin users", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getById throws NOT_FOUND when no purchase exists", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockGetPurchaseById.mockResolvedValue(null);

    await expect(
      caller.getById({ orderId: "order-404" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Purchase not found",
    });
  });

  test("getById wraps non-TRPC errors", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockGetPurchaseById.mockRejectedValue(new Error("polar down"));

    await expect(caller.getById({ orderId: "order-1" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch purchase",
    });
  });

  test("refund calls refundOrder and returns result", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockRefundOrder.mockResolvedValue({ success: true });

    const result = await caller.refund({
      orderId: "order-1",
      reason: "customer_request",
      comment: "Requested by customer",
    });

    expect(mockRefundOrder).toHaveBeenCalledWith({
      orderId: "order-1",
      reason: "customer_request",
      comment: "Requested by customer",
    });
    expect(result).toEqual({ success: true });
  });

  test("refund wraps internal failures", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockRefundOrder.mockRejectedValue(new Error("api timeout"));

    await expect(caller.refund({ orderId: "order-1" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to refund order",
    });
  });
});
