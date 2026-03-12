import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNumber,
} from "../invoice.js";
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
      invoice: {
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

describe("getAllInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllInvoices).toBe("function");
  });

  test("returns invoices with count on success", async () => {
    const mockInvoices = [
      { id: "inv:1", invoiceNumber: "INV-001" },
      { id: "inv:2", invoiceNumber: "INV-002" },
    ];
    mockExecute.mockResolvedValueOnce(mockInvoices);

    const result = await getAllInvoices();
    expect(result.invoices).toEqual(mockInvoices);
    expect(result.count).toBe(2);
  });

  test("returns empty array when no invoices exist", async () => {
    mockExecute.mockResolvedValueOnce([]);

    const result = await getAllInvoices();
    expect(result.invoices).toEqual([]);
    expect(result.count).toBe(0);
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB connection failed"));

    await expect(getAllInvoices()).rejects.toThrow("DB connection failed");
  });
});

describe("getInvoiceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns invoice when found", async () => {
    const mockInvoice = { id: "inv:1", invoiceNumber: "INV-001" };
    mockExecute.mockResolvedValueOnce(mockInvoice);

    const result = await getInvoiceById("inv:1");
    expect(result).toEqual(mockInvoice);
  });

  test("returns null when invoice not found", async () => {
    mockExecute.mockResolvedValueOnce(undefined);

    const result = await getInvoiceById("inv:nonexistent");
    expect(result).toBeNull();
  });

  test("throws when database query fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Query timeout"));

    await expect(getInvoiceById("inv:1")).rejects.toThrow("Query timeout");
  });
});

describe("getInvoiceByNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns invoice when found by number", async () => {
    const mockInvoice = { id: "inv:1", invoiceNumber: "INV-001" };
    mockExecute.mockResolvedValueOnce(mockInvoice);

    const result = await getInvoiceByNumber("INV-001");
    expect(result).toEqual(mockInvoice);
  });

  test("returns null when invoice number not found", async () => {
    mockExecute.mockResolvedValueOnce(undefined);

    const result = await getInvoiceByNumber("INV-999");
    expect(result).toBeNull();
  });
});
