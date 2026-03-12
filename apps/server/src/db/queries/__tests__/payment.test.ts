import {
  getAllPayments,
  getPaymentById,
  getPaymentByTransactionId,
} from "../payment.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: vi.fn().mockReturnValue({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    }),
  },
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      payment: {
        findMany: vi.fn().mockReturnValue({
          prepare: vi.fn().mockReturnValue({ execute: mockExecute }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: vi.fn().mockReturnValue({ execute: mockExecute }),
        }),
      },
    },
  },
}));

describe("getAllPayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllPayments).toBe("function");
  });

  test("returns payments with count on success", async () => {
    const mockPayments = [
      { id: "pay:1", transactionId: "txn:001", amount: 9900 },
      { id: "pay:2", transactionId: "txn:002", amount: 4900 },
    ];
    mockExecute.mockResolvedValueOnce(mockPayments);

    const result = await getAllPayments();
    expect(result.payments).toEqual(mockPayments);
    expect(result.count).toBe(2);
  });

  test("returns empty array when no payments exist", async () => {
    mockExecute.mockResolvedValueOnce([]);

    const result = await getAllPayments();
    expect(result.payments).toEqual([]);
    expect(result.count).toBe(0);
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Connection refused"));

    await expect(getAllPayments()).rejects.toThrow("Connection refused");
  });
});

describe("getPaymentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns payment when found", async () => {
    const mockPayment = { id: "pay:1", transactionId: "txn:001" };
    mockExecute.mockResolvedValueOnce(mockPayment);

    const result = await getPaymentById("pay:1");
    expect(result).toEqual(mockPayment);
  });

  test("returns null when payment not found", async () => {
    mockExecute.mockResolvedValueOnce(undefined);

    const result = await getPaymentById("pay:nonexistent");
    expect(result).toBeNull();
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Query timeout"));

    await expect(getPaymentById("pay:1")).rejects.toThrow("Query timeout");
  });
});

describe("getPaymentByTransactionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns payment when found by transaction ID", async () => {
    const mockPayment = { id: "pay:1", transactionId: "txn:001" };
    mockExecute.mockResolvedValueOnce(mockPayment);

    const result = await getPaymentByTransactionId("txn:001");
    expect(result).toEqual(mockPayment);
  });

  test("returns null when transaction ID not found", async () => {
    mockExecute.mockResolvedValueOnce(undefined);

    const result = await getPaymentByTransactionId("txn:nonexistent");
    expect(result).toBeNull();
  });
});
