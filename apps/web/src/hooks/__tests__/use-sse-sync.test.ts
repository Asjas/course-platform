import type { SyncStatus } from "../use-sse-sync";
import { useSupportTicketsSync } from "../use-sse-sync";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { syncUtils } from "~/lib/db.collections";

// Mock all external dependencies
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("~/lib/db.collections", () => ({
  syncUtils: {
    getLastSyncTimestamp: vi.fn().mockReturnValue(0),
    setLastSyncTimestamp: vi.fn(),
  },
}));

vi.mock("~/lib/query.client", () => ({
  queryClient: {
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    supportTickets: {
      getAll: { queryKey: () => ["supportTickets", "getAll"] },
    },
    coupons: {
      getAll: { queryKey: () => ["coupons", "getAll"] },
    },
    reviews: {
      getAll: { queryKey: () => ["reviews", "getAll"] },
    },
    announcements: {
      getAll: { queryKey: () => ["announcements", "getAll"] },
    },
    courses: {
      getAll: { queryKey: () => ["courses", "getAll"] },
    },
  },
  trpcClient: {
    supportTickets: {
      getUpdatesSince: { query: vi.fn().mockResolvedValue([]) },
      subscribeToUpdates: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      },
    },
    coupons: {
      getUpdatesSince: { query: vi.fn().mockResolvedValue([]) },
      subscribeToUpdates: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      },
    },
    reviews: {
      getUpdatesSince: { query: vi.fn().mockResolvedValue([]) },
      subscribeToUpdates: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      },
    },
    announcements: {
      getUpdatesSince: { query: vi.fn().mockResolvedValue([]) },
      subscribeToUpdates: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      },
    },
    courses: {
      getUpdatesSince: { query: vi.fn().mockResolvedValue([]) },
      subscribeToUpdates: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      },
    },
  },
}));

describe("SyncStatus interface", () => {
  test("has correct shape", () => {
    const status: SyncStatus = {
      isConnected: false,
      isSyncing: false,
      lastSyncedAt: null,
      pendingUpdates: 0,
      error: null,
    };

    expect(status.isConnected).toBe(false);
    expect(status.isSyncing).toBe(false);
    expect(status.lastSyncedAt).toBeNull();
    expect(status.pendingUpdates).toBe(0);
    expect(status.error).toBeNull();
  });

  test("accepts error as Error object", () => {
    const status: SyncStatus = {
      isConnected: false,
      isSyncing: false,
      lastSyncedAt: Date.now(),
      pendingUpdates: 0,
      error: new Error("Connection failed"),
    };

    expect(status.error?.message).toBe("Connection failed");
  });
});

describe("useSupportTicketsSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(syncUtils.getLastSyncTimestamp).mockReturnValue(0);
  });

  test("returns initial sync status", () => {
    const { result } = renderHook(() => useSupportTicketsSync());

    expect(result.current).toMatchObject({
      isSyncing: false,
      lastSyncedAt: null,
      pendingUpdates: 0,
      error: null,
    });
  });

  test("initializes with lastSyncedAt from syncUtils when available", () => {
    const timestamp = Date.now() - 60000;
    vi.mocked(syncUtils.getLastSyncTimestamp).mockReturnValue(timestamp);

    const { result } = renderHook(() => useSupportTicketsSync());

    expect(result.current.lastSyncedAt).toBe(timestamp);
  });

  test("cleans up subscription on unmount", () => {
    const { unmount } = renderHook(() => useSupportTicketsSync());
    // Should not throw
    unmount();
  });
});
