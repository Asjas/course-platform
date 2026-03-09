import { syncStatusRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockGetSyncStatusesForUser,
  mockGetSyncStatus,
  mockUpsertSyncStatus,
  mockUpdateOnlineStatus,
} = vi.hoisted(() => ({
  mockGetSyncStatusesForUser: vi.fn(),
  mockGetSyncStatus: vi.fn(),
  mockUpsertSyncStatus: vi.fn(),
  mockUpdateOnlineStatus: vi.fn(),
}));

vi.mock("~/routers/syncStatus/queries.js", () => ({
  getSyncStatusesForUser: mockGetSyncStatusesForUser,
  getSyncStatus: mockGetSyncStatus,
}));

vi.mock("~/routers/syncStatus/mutations.js", () => ({
  upsertSyncStatus: mockUpsertSyncStatus,
  updateOnlineStatus: mockUpdateOnlineStatus,
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  return syncStatusRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
  } as never);
}

describe("syncStatusRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll rejects unauthenticated callers", async () => {
    const caller = createCaller();

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  });

  test("getAll returns statuses for authenticated user", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    mockGetSyncStatusesForUser.mockResolvedValue([
      {
        id: "sync-1",
        userId: "user-1",
        collectionName: "courses",
        syncState: "synced",
      },
    ]);

    const result = await caller.getAll();

    expect(mockGetSyncStatusesForUser).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(1);
  });

  test("getByCollection passes current user id", async () => {
    const caller = createCaller({ id: "user-7", role: "student" });
    mockGetSyncStatus.mockResolvedValue({
      id: "sync-2",
      userId: "user-7",
      collectionName: "notifications",
      syncState: "syncing",
    });

    const result = await caller.getByCollection({
      collectionName: "notifications",
    });

    expect(mockGetSyncStatus).toHaveBeenCalledWith("user-7", "notifications");
    expect(result).toMatchObject({ collectionName: "notifications" });
  });

  test("update wraps errors from upsertSyncStatus", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    mockUpsertSyncStatus.mockRejectedValue(new Error("write failed"));

    await expect(
      caller.update({
        collectionName: "courses",
        syncState: "error",
        errorMessage: "write failed",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update sync status",
    });
  });

  test("setOnlineStatus forwards the user id and returns success", async () => {
    const caller = createCaller({ id: "user-3", role: "student" });
    mockUpdateOnlineStatus.mockResolvedValue(undefined);

    const result = await caller.setOnlineStatus({ isOnline: false });

    expect(mockUpdateOnlineStatus).toHaveBeenCalledWith("user-3", false);
    expect(result).toEqual({ success: true });
  });

  test("setOnlineStatus wraps internal failures", async () => {
    const caller = createCaller({ id: "user-3", role: "student" });
    mockUpdateOnlineStatus.mockRejectedValue(new Error("db unavailable"));

    await expect(
      caller.setOnlineStatus({ isOnline: true }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update online status",
    });
  });
});
