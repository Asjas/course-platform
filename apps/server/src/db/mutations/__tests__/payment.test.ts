import {
  deletePaymentById,
  insertPayment,
  refundedPaymentById,
  updatePaymentById,
} from "../payment.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockReturning } = vi.hoisted(() => ({
  mockReturning: vi.fn(),
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
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
  },
}));

vi.mock("~/db/schema/purchase.js", () => ({
  payment: {
    id: "id",
    transactionId: "transactionId",
  },
}));

describe("insertPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof insertPayment).toBe("function");
  });

  test("inserts a new payment and returns it", async () => {
    const newPayment = {
      id: "pay:1",
      transactionId: "txn:001",
      amount: 9900,
      userId: "user:1",
    };
    mockReturning.mockResolvedValueOnce([newPayment]);

    const result = await insertPayment(newPayment as never);
    expect(result).toEqual([newPayment]);
  });

  test("throws when insert fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Duplicate transaction ID"));

    await expect(insertPayment({ id: "pay:dup" } as never)).rejects.toThrow(
      "Duplicate transaction ID",
    );
  });
});

describe("updatePaymentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates payment and returns updated record", async () => {
    const updated = { id: "pay:1", amount: 4900 };
    mockReturning.mockResolvedValueOnce([updated]);

    const result = await updatePaymentById("pay:1", {
      amount: 4900,
    } as never);
    expect(result).toEqual([updated]);
  });

  test("returns empty array when payment ID does not exist", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await updatePaymentById("pay:nonexistent", {} as never);
    expect(result).toEqual([]);
  });

  test("throws when update fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Update failed"));

    await expect(updatePaymentById("pay:1", {} as never)).rejects.toThrow(
      "Update failed",
    );
  });
});

describe("refundedPaymentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("refunds payment and returns updated record", async () => {
    const refunded = {
      id: "pay:1",
      refundedAt: new Date().toISOString(),
      status: "refunded",
    };
    mockReturning.mockResolvedValueOnce([refunded]);

    const result = await refundedPaymentById("pay:1", {
      status: "refunded",
    } as never);
    expect(result).toEqual([refunded]);
  });

  test("throws when refund operation fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Refund failed"));

    await expect(refundedPaymentById("pay:1", {} as never)).rejects.toThrow(
      "Refund failed",
    );
  });
});

describe("deletePaymentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes payment and returns deleted ID", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "pay:1" }]);

    const result = await deletePaymentById({ id: "pay:1" } as never);
    expect(result).toBeDefined();
  });

  test("throws when delete fails", async () => {
    mockReturning.mockRejectedValueOnce(
      new Error("Foreign key constraint violation"),
    );

    await expect(deletePaymentById({ id: "pay:1" } as never)).rejects.toThrow(
      "Foreign key constraint violation",
    );
  });
});
