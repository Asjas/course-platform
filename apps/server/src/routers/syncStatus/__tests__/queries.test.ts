import { getSyncStatus, getSyncStatusesForUser } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      syncStatus: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

vi.mock("~/db/schema/syncStatus.js", () => ({
  syncStatus: {
    userId: "userId",
    collectionName: "collectionName",
  },
  syncCollectionNames: {
    enumValues: [
      "courses",
      "reviews",
      "purchases",
      "notifications",
      "supportTickets",
      "coupons",
      "chatReports",
      "announcements",
      "syncStatus",
    ],
  },
}));

describe("getSyncStatusesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getSyncStatusesForUser).toBe("function");
  });

  test("returns sync statuses for a user", async () => {
    const { db } = await import("~/db/index.js");
    const mockStatuses = [
      {
        id: "sync:1",
        userId: "user:1",
        collectionName: "courses",
        syncState: "synced",
        isOnline: true,
      },
      {
        id: "sync:2",
        userId: "user:1",
        collectionName: "reviews",
        syncState: "offline",
        isOnline: false,
      },
    ];
    vi.mocked(db.query.syncStatus.findMany).mockResolvedValueOnce(
      mockStatuses as never,
    );

    const result = await getSyncStatusesForUser("user:1");
    expect(result).toEqual(mockStatuses);
  });

  test("returns empty array when no statuses exist", async () => {
    const result = await getSyncStatusesForUser("user:none");
    expect(result).toEqual([]);
  });
});

describe("getSyncStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getSyncStatus).toBe("function");
  });

  test("returns a sync status for a specific collection", async () => {
    const { db } = await import("~/db/index.js");
    const mockStatus = {
      id: "sync:1",
      userId: "user:1",
      collectionName: "courses",
      syncState: "synced",
      isOnline: true,
      lastSyncedAt: new Date(),
    };
    vi.mocked(db.query.syncStatus.findFirst).mockResolvedValueOnce(
      mockStatus as never,
    );

    const result = await getSyncStatus("user:1", "courses");
    expect(result).toEqual(mockStatus);
  });

  test("returns undefined when no status exists", async () => {
    const result = await getSyncStatus("user:1", "courses");
    expect(result).toBeUndefined();
  });
});
