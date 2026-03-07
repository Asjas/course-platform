import { getAllPurchases, getPurchaseById } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockList, mockGet } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("@polar-sh/sdk", () => ({
  Polar: vi.fn().mockImplementation(function () {
    return {
      orders: {
        list: mockList,
        get: mockGet,
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

describe("getAllPurchases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllPurchases).toBe("function");
  });

  test("returns orders from Polar API", async () => {
    const mockOrder = {
      id: "order:1",
      createdAt: new Date("2025-01-01"),
      modifiedAt: null,
      status: "paid",
      paid: true,
      totalAmount: 9900,
      refundedAmount: 0,
      taxAmount: 0,
      currency: "usd",
      billingReason: "purchase",
      customerId: "cust:1",
      productId: "prod:1",
      checkoutId: "checkout:1",
      userId: "user:1",
      invoiceNumber: "INV-001",
      description: "Test Course",
      customer: {
        id: "cust:1",
        email: "test@example.com",
        emailVerified: true,
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
        organizationId: "org:1",
      },
      product: {
        id: "prod:1",
        name: "Test Course",
        description: "A test course",
        isRecurring: false,
        isArchived: false,
      },
    };

    mockList.mockResolvedValue({
      result: { items: [mockOrder] },
    });

    const result = await getAllPurchases();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("order:1");
    expect(result[0].createdAt).toBe("2025-01-01T00:00:00.000Z");
  });

  test("returns empty array on ENOTFOUND error", async () => {
    mockList.mockRejectedValue(new Error("ENOTFOUND"));

    const result = await getAllPurchases();
    expect(result).toEqual([]);
  });

  test("returns empty array on fetch failed error", async () => {
    mockList.mockRejectedValue(new Error("fetch failed"));

    const result = await getAllPurchases();
    expect(result).toEqual([]);
  });

  test("throws on other errors", async () => {
    mockList.mockRejectedValue(new Error("Unauthorized"));

    await expect(getAllPurchases()).rejects.toThrow("Unauthorized");
  });
});

describe("getPurchaseById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getPurchaseById).toBe("function");
  });

  test("returns null on ENOTFOUND error", async () => {
    mockGet.mockRejectedValue(new Error("ENOTFOUND"));

    const result = await getPurchaseById("order:1");
    expect(result).toBeNull();
  });

  test("returns null on fetch failed error", async () => {
    mockGet.mockRejectedValue(new Error("fetch failed"));

    const result = await getPurchaseById("order:1");
    expect(result).toBeNull();
  });

  test("returns null on other errors", async () => {
    mockGet.mockRejectedValue(new Error("Not found"));

    const result = await getPurchaseById("order:1");
    expect(result).toBeNull();
  });
});
