import { auditRouter } from "../index.js";
import { fromPartial } from "@total-typescript/shoehorn";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockGetAllGdprAuditLogs } = vi.hoisted(() => ({
  mockGetAllGdprAuditLogs: vi.fn(),
}));

vi.mock("~/db/queries/gdprAudit.js", () => ({
  getAllGdprAuditLogs: mockGetAllGdprAuditLogs,
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  return auditRouter.createCaller(
    fromPartial({
      user,
      hasRole: (role: string) => user?.role === role,
    }),
  );
}

describe("auditRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getGdprAuditLogs denies non-admin users", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getGdprAuditLogs({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getGdprAuditLogs forwards limit and offset", async () => {
    const caller = createCaller({ id: "admin-1", role: "admin" });
    mockGetAllGdprAuditLogs.mockResolvedValue([{ id: "audit-1" }]);

    const result = await caller.getGdprAuditLogs({ limit: 20, offset: 5 });

    expect(mockGetAllGdprAuditLogs).toHaveBeenCalledWith(20, 5);
    expect(result).toEqual([{ id: "audit-1" }]);
  });

  test("getGdprAuditLogs uses schema defaults", async () => {
    const caller = createCaller({ id: "admin-2", role: "admin" });
    mockGetAllGdprAuditLogs.mockResolvedValue([]);

    await caller.getGdprAuditLogs({});

    expect(mockGetAllGdprAuditLogs).toHaveBeenCalledWith(100, 0);
  });
});
