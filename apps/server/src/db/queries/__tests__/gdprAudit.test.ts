import { getAllGdprAuditLogs } from "../gdprAudit.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    query: {
      gdprAuditLog: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("~/db/index.js", () => ({
  db: mockDb,
}));

describe("getAllGdprAuditLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns GDPR audit logs with user data", async () => {
    const mockLogs = [
      {
        id: "log:1",
        userId: "user:1",
        action: "data_export",
        details: "User requested data export",
        createdAt: new Date("2026-01-01"),
        user: {
          id: "user:1",
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
      },
      {
        id: "log:2",
        userId: "user:2",
        action: "data_deletion",
        details: "User requested account deletion",
        createdAt: new Date("2026-01-02"),
        user: {
          id: "user:2",
          name: "Jane Smith",
          email: "jane@example.com",
          username: "janesmith",
        },
      },
    ];

    mockDb.query.gdprAuditLog.findMany.mockResolvedValue(mockLogs);

    const result = await getAllGdprAuditLogs(10, 0);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      action: "data_export",
      user: { name: "John Doe" },
    });
    expect(mockDb.query.gdprAuditLog.findMany).toHaveBeenCalledWith({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: expect.any(Function),
      limit: 10,
      offset: 0,
    });
  });

  test("uses default limit and offset if not provided", async () => {
    mockDb.query.gdprAuditLog.findMany.mockResolvedValue([]);

    await getAllGdprAuditLogs();

    expect(mockDb.query.gdprAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 100,
        offset: 0,
      }),
    );
  });

  test("returns empty array when no logs exist", async () => {
    mockDb.query.gdprAuditLog.findMany.mockResolvedValue([]);

    const result = await getAllGdprAuditLogs(50, 0);

    expect(result).toEqual([]);
  });

  test("supports pagination with custom limit and offset", async () => {
    const mockLogs = Array.from({ length: 20 }, (_, i) => ({
      id: `log:${i}`,
      userId: `user:${i}`,
      action: "data_access",
      details: `Log ${i}`,
      createdAt: new Date(),
      user: {
        id: `user:${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        username: `user${i}`,
      },
    }));

    mockDb.query.gdprAuditLog.findMany.mockResolvedValue(mockLogs);

    const result = await getAllGdprAuditLogs(20, 40);

    expect(mockDb.query.gdprAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 20,
        offset: 40,
      }),
    );
    expect(result).toHaveLength(20);
  });
});
