import { supportStatusRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockGetSupportTeam, mockSetSupportStatusInRedis, mockGetMyStatus } =
  vi.hoisted(() => ({
    mockGetSupportTeam: vi.fn(),
    mockSetSupportStatusInRedis: vi.fn(),
    mockGetMyStatus: vi.fn(),
  }));

vi.mock("~/routers/supportStatus/queries.js", () => ({
  getSupportTeam: mockGetSupportTeam,
  setSupportStatusInRedis: mockSetSupportStatusInRedis,
  getMyStatus: mockGetMyStatus,
}));

function createCaller(user: { id: string; role: string }) {
  const hasRole = (role: string) => user.role === role;
  return supportStatusRouter.createCaller({ user, hasRole } as never);
}

describe("supportStatusRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getSupportTeam returns support team list", async () => {
    mockGetSupportTeam.mockResolvedValue([
      {
        id: "admin-1",
        name: "Admin",
        username: "admin",
        image: null,
        status: "online",
      },
    ]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getSupportTeam();

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("online");
  });

  test("setStatus updates status for admin", async () => {
    mockSetSupportStatusInRedis.mockResolvedValue(undefined);

    const caller = createCaller({ id: "admin-1", role: "admin" });
    const result = await caller.setStatus({ status: "offline" });

    expect(mockSetSupportStatusInRedis).toHaveBeenCalledWith(
      "admin-1",
      "offline",
    );
    expect(result).toEqual({ success: true });
  });

  test("setStatus denies non-admin users", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.setStatus({ status: "online" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getMyStatus returns admin status", async () => {
    mockGetMyStatus.mockResolvedValue({ status: "online" });

    const caller = createCaller({ id: "admin-1", role: "admin" });
    const result = await caller.getMyStatus();

    expect(mockGetMyStatus).toHaveBeenCalledWith("admin-1");
    expect(result).toEqual({ status: "online" });
  });

  test("wraps internal failures with TRPC internal error", async () => {
    mockGetSupportTeam.mockRejectedValue(new Error("boom"));

    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getSupportTeam()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch support team status",
    });
  });
});
