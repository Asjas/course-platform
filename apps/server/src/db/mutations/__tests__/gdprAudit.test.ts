import { insertGdprAuditLog } from "../gdprAudit.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockDb, mockLog } = vi.hoisted(() => ({
  mockDb: {
    insert: vi.fn(),
  },
  mockLog: {
    error: vi.fn(),
  },
}));

vi.mock("~/db/index.js", () => ({
  db: mockDb,
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => mockLog,
  },
}));

describe("insertGdprAuditLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("inserts GDPR audit log successfully", async () => {
    const mockAuditLog = {
      id: "log:1",
      userId: "user:1",
      actionType: "data_export" as const,
      status: "success" as const,
      metadata: "User exported their data",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    await insertGdprAuditLog(mockAuditLog);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockLog.error).not.toHaveBeenCalled();
  });

  test("logs error but does not throw when insert fails", async () => {
    const mockAuditLog = {
      id: "log:2",
      userId: "user:2",
      actionType: "data_deletion" as const,
      status: "success" as const,
      metadata: "User deleted their account",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dbError = new Error("Database connection failed");
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockRejectedValue(dbError),
    });

    // Should not throw
    await expect(insertGdprAuditLog(mockAuditLog)).resolves.toBeUndefined();

    expect(mockLog.error).toHaveBeenCalledWith(
      dbError,
      "Failed to insert GDPR audit log",
    );
  });

  test("handles various GDPR action types", async () => {
    const actions = [
      "data_export",
      "data_deletion",
      "consent_update",
      "data_access",
    ] as const;

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    for (const actionType of actions) {
      await insertGdprAuditLog({
        id: `log:${actionType}`,
        userId: "user:1",
        actionType,
        status: "success",
        metadata: `Action: ${actionType}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    expect(mockDb.insert).toHaveBeenCalledTimes(4);
  });
});
