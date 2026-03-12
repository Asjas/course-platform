import { dataExportRouter } from "../index.js";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockGetAllUserData,
  mockCheckExportRateLimit,
  mockInsertGdprAuditLog,
  mockCreateCsvSection,
} = vi.hoisted(() => ({
  mockGetAllUserData: vi.fn(),
  mockCheckExportRateLimit: vi.fn(),
  mockInsertGdprAuditLog: vi.fn(),
  mockCreateCsvSection: vi.fn(),
}));

vi.mock("../queries.js", () => ({
  getAllUserData: mockGetAllUserData,
}));

vi.mock("../rateLimit.js", () => ({
  checkExportRateLimit: mockCheckExportRateLimit,
}));

vi.mock("~/db/mutations/gdprAudit.js", () => ({
  insertGdprAuditLog: mockInsertGdprAuditLog,
}));

vi.mock("../csvUtils.js", () => ({
  createCsvSection: mockCreateCsvSection,
}));

vi.mock("ulid", () => ({
  ulid: vi.fn(() => "mock-ulid-123"),
}));

const mockUserData = {
  userProfile: {
    id: "user-1",
    name: "Test User",
    username: "testuser",
    displayUsername: "TestUser",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    role: "user",
    color: "#000",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-02",
  },
  enrollments: [],
  courseProgress: [],
  lessonProgress: [],
  payments: [],
  notifications: [],
  supportTickets: [],
  wishlists: [],
  reviews: [],
  dmRequestsSent: [],
  dmRequestsReceived: [],
  dmConversations: [],
  certificates: [],
  chatReports: [],
};

function createCaller(user?: { id: string; role: string }) {
  const log = { info: vi.fn(), error: vi.fn() };
  // Minimal context matching the subset the router procedures access.
  // Full tRPC context includes Fastify request/reply + cache but these
  // procedures only touch user, hasRole, and request.log.
  const ctx = {
    user: user || null,
    hasRole: (role: string) => user?.role === role,
    request: {
      log,
      headers: { "user-agent": "test-agent" },
      ip: "127.0.0.1",
    },
  };
  return dataExportRouter.createCaller(
    ctx as unknown as Parameters<typeof dataExportRouter.createCaller>[0],
  );
}

describe("dataExportRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckExportRateLimit.mockResolvedValue(undefined);
    mockGetAllUserData.mockResolvedValue(mockUserData);
    mockInsertGdprAuditLog.mockResolvedValue(undefined);
    mockCreateCsvSection.mockReturnValue(["section-header", "data-row"]);
  });

  test("exportData rejects unauthenticated users", async () => {
    const caller = createCaller();

    await expect(caller.exportData({ format: "json" })).rejects.toThrow(
      TRPCError,
    );
  });

  test("exportData returns JSON format with user data and export date", async () => {
    const caller = createCaller({ id: "user-1", role: "user" });

    const result = await caller.exportData({ format: "json" });

    expect(result.format).toBe("json");
    expect(result.data).toHaveProperty("exportDate");
    expect(result.data).toHaveProperty("userProfile");
    expect(mockGetAllUserData).toHaveBeenCalledWith("user-1");
  });

  test("exportData creates GDPR audit log on successful JSON export", async () => {
    const caller = createCaller({ id: "user-1", role: "user" });

    await caller.exportData({ format: "json" });

    expect(mockInsertGdprAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        actionType: "data_export",
        status: "success",
        exportFormat: "json",
      }),
    );
  });

  test("exportData returns CSV format with string data", async () => {
    const caller = createCaller({ id: "user-1", role: "user" });

    const result = await caller.exportData({ format: "csv" });

    expect(result.format).toBe("csv");
    expect(typeof result.data).toBe("string");
    expect(mockCreateCsvSection).toHaveBeenCalled();
  });

  test("exportData logs and audits failed exports", async () => {
    mockGetAllUserData.mockRejectedValue(new Error("DB connection failed"));

    const caller = createCaller({ id: "user-1", role: "user" });

    await expect(caller.exportData({ format: "json" })).rejects.toThrow(
      "DB connection failed",
    );

    expect(mockInsertGdprAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        actionType: "data_export",
        status: "failure",
        errorMessage: "DB connection failed",
      }),
    );
  });
});
