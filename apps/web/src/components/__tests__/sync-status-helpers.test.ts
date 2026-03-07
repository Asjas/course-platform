import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  formatRelativeTime,
  getOverallStatus,
} from "~/components/SyncStatusIndicator";
import type { CollectionSyncStatus } from "~/components/SyncStatusIndicator";

function makeStatus(
  overrides: Partial<CollectionSyncStatus> = {},
): CollectionSyncStatus {
  return {
    name: "test",
    displayName: "Test",
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: null,
    pendingUpdates: 0,
    error: null,
    ...overrides,
  };
}

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns 'Never' for null", () => {
    expect(formatRelativeTime(null)).toBe("Never");
  });

  test("returns 'Never' for 0", () => {
    expect(formatRelativeTime(0)).toBe("Never");
  });

  test("returns 'Just now' for less than 1 second ago", () => {
    expect(formatRelativeTime(Date.now() - 500)).toBe("Just now");
  });

  test("returns seconds ago", () => {
    expect(formatRelativeTime(Date.now() - 30_000)).toBe("30s ago");
  });

  test("returns minutes ago", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toBe("5m ago");
  });

  test("returns hours ago", () => {
    expect(formatRelativeTime(Date.now() - 2 * 3_600_000)).toBe("2h ago");
  });

  test("returns days ago", () => {
    expect(formatRelativeTime(Date.now() - 3 * 86_400_000)).toBe("3d ago");
  });
});

describe("getOverallStatus", () => {
  test("returns 'error' if any collection has an error", () => {
    const collections = [
      makeStatus({ isConnected: true }),
      makeStatus({ error: new Error("fail") }),
    ];
    expect(getOverallStatus(collections)).toBe("error");
  });

  test("returns 'syncing' if any collection is syncing (no errors)", () => {
    const collections = [
      makeStatus({ isConnected: true }),
      makeStatus({ isSyncing: true }),
    ];
    expect(getOverallStatus(collections)).toBe("syncing");
  });

  test("returns 'connected' if all collections are connected", () => {
    const collections = [
      makeStatus({ isConnected: true }),
      makeStatus({ isConnected: true }),
    ];
    expect(getOverallStatus(collections)).toBe("connected");
  });

  test("returns 'disconnected' if not all connected and no errors/syncing", () => {
    const collections = [
      makeStatus({ isConnected: true }),
      makeStatus({ isConnected: false }),
    ];
    expect(getOverallStatus(collections)).toBe("disconnected");
  });

  test("error takes priority over syncing", () => {
    const collections = [
      makeStatus({ isSyncing: true }),
      makeStatus({ error: new Error("fail") }),
    ];
    expect(getOverallStatus(collections)).toBe("error");
  });

  test("returns 'connected' for empty array (vacuous truth)", () => {
    expect(getOverallStatus([])).toBe("connected");
  });
});
