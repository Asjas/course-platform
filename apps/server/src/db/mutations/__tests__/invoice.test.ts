import {
  deleteInvoiceById,
  insertInvoice,
  updateInvoiceById,
} from "../invoice.js";
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
  invoice: {
    id: "id",
    invoiceNumber: "invoiceNumber",
  },
}));

describe("insertInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof insertInvoice).toBe("function");
  });

  test("inserts a new invoice and returns it", async () => {
    const newInvoice = {
      id: "inv:1",
      invoiceNumber: "INV-001",
      amount: 9900,
      userId: "user:1",
    };
    mockReturning.mockResolvedValueOnce([newInvoice]);

    const result = await insertInvoice(newInvoice as never);
    expect(result).toEqual([newInvoice]);
  });

  test("throws when insert fails", async () => {
    mockReturning.mockRejectedValueOnce(
      new Error("Unique constraint violation"),
    );

    await expect(insertInvoice({ id: "inv:dup" } as never)).rejects.toThrow(
      "Unique constraint violation",
    );
  });
});

describe("updateInvoiceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates invoice and returns updated record", async () => {
    const updated = { id: "inv:1", invoiceNumber: "INV-001-UPDATED" };
    mockReturning.mockResolvedValueOnce([updated]);

    const result = await updateInvoiceById("inv:1", {
      invoiceNumber: "INV-001-UPDATED",
    } as never);
    expect(result).toEqual([updated]);
  });

  test("returns empty array when invoice ID does not exist", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await updateInvoiceById("inv:nonexistent", {} as never);
    expect(result).toEqual([]);
  });

  test("throws when update fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Update failed"));

    await expect(updateInvoiceById("inv:1", {} as never)).rejects.toThrow(
      "Update failed",
    );
  });
});

describe("deleteInvoiceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes invoice and returns deleted ID", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "inv:1" }]);

    const result = await deleteInvoiceById({ id: "inv:1" } as never);
    expect(result).toBeDefined();
  });

  test("throws when delete fails", async () => {
    mockReturning.mockRejectedValueOnce(
      new Error("Foreign key constraint violation"),
    );

    await expect(deleteInvoiceById({ id: "inv:1" } as never)).rejects.toThrow(
      "Foreign key constraint violation",
    );
  });
});
