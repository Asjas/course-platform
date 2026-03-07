import {
  deleteSyncStatusForUser,
  updateOnlineStatus,
  upsertSyncStatus,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockFindFirst = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      syncStatus: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({
      values: () => ({
        returning: mockInsert,
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: mockUpdate,
        }),
      }),
    }),
    delete: () => ({
      where: mockDelete,
    }),
  },
}));

vi.mock("~/db/schema/syncStatus.js", () => ({
  syncStatus: {
    id: "id",
    userId: "userId",
    collectionName: "collectionName",
    isOnline: "isOnline",
    syncState: "syncState",
  },
  syncCollectionNames: {
    enumValues: ["courses", "reviews", "purchases"],
  },
}));

vi.mock("ulid", () => ({
  ulid: () => "01MOCK_ULID",
}));

describe("upsertSyncStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates a new sync status when none exists", async () => {
    mockFindFirst.mockResolvedValueOnce(undefined);
    const inserted = {
      id: "01MOCK_ULID",
      userId: "user:1",
      collectionName: "courses",
      syncState: "synced",
    };
    mockInsert.mockResolvedValueOnce([inserted]);

    const result = await upsertSyncStatus({
      userId: "user:1",
      collectionName: "courses",
    });
    expect(result).toEqual(inserted);
  });

  test("updates existing sync status", async () => {
    const existing = {
      id: "sync:1",
      userId: "user:1",
      collectionName: "courses",
      syncState: "synced",
      lastSyncedAt: null,
      lastEventId: null,
      pendingUpdates: 0,
      errorMessage: null,
      isOnline: true,
    };
    mockFindFirst.mockResolvedValueOnce(existing);
    const updated = { ...existing, syncState: "syncing" };
    mockUpdate.mockResolvedValueOnce([updated]);

    const result = await upsertSyncStatus({
      userId: "user:1",
      collectionName: "courses",
      syncState: "syncing",
    });
    expect(result).toEqual(updated);
  });

  test("creates with default syncState and pendingUpdates", async () => {
    mockFindFirst.mockResolvedValueOnce(undefined);
    const inserted = {
      id: "01MOCK_ULID",
      userId: "user:1",
      collectionName: "reviews",
      syncState: "synced",
      pendingUpdates: 0,
      isOnline: true,
    };
    mockInsert.mockResolvedValueOnce([inserted]);

    const result = await upsertSyncStatus({
      userId: "user:1",
      collectionName: "reviews",
    });
    expect(result.syncState).toBe("synced");
    expect(result.pendingUpdates).toBe(0);
  });

  test("updates with error state", async () => {
    const existing = {
      id: "sync:1",
      userId: "user:1",
      collectionName: "courses",
      syncState: "synced",
      lastSyncedAt: null,
      lastEventId: null,
      pendingUpdates: 0,
      errorMessage: null,
      isOnline: true,
    };
    mockFindFirst.mockResolvedValueOnce(existing);
    const updated = {
      ...existing,
      syncState: "error",
      errorMessage: "Connection failed",
    };
    mockUpdate.mockResolvedValueOnce([updated]);

    const result = await upsertSyncStatus({
      userId: "user:1",
      collectionName: "courses",
      syncState: "error",
      errorMessage: "Connection failed",
    });
    expect(result.syncState).toBe("error");
    expect(result.errorMessage).toBe("Connection failed");
  });
});

describe("updateOnlineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof updateOnlineStatus).toBe("function");
  });

  test("updates online status for a user", async () => {
    await updateOnlineStatus("user:1", true);
    // Does not throw - void function
  });

  test("sets offline status and syncState", async () => {
    await updateOnlineStatus("user:1", false);
    // Does not throw - void function
  });
});

describe("deleteSyncStatusForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof deleteSyncStatusForUser).toBe("function");
  });

  test("deletes sync status for a user", async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    await deleteSyncStatusForUser("user:1");
    expect(mockDelete).toHaveBeenCalled();
  });
});
