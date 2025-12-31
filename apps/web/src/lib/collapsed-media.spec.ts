import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCollapsedMedia,
  getCollapsedMessageIds,
  isMediaCollapsed,
  setMediaCollapsed,
} from "~/lib/collapsed-media";

describe("collapsed-media", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _, ...rest } = store;
        store = rest;
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.clear();
    vi.stubGlobal("localStorage", localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getCollapsedMessageIds", () => {
    it("should return empty array when localStorage is empty", () => {
      const result = getCollapsedMessageIds();
      expect(result).toEqual([]);
    });

    it("should return stored message IDs", () => {
      localStorageMock.setItem(
        "collapsed-media",
        JSON.stringify(["msg1", "msg2"]),
      );
      const result = getCollapsedMessageIds();
      expect(result).toEqual(["msg1", "msg2"]);
    });

    it("should return empty array for invalid JSON", () => {
      localStorageMock.setItem("collapsed-media", "invalid-json");
      const result = getCollapsedMessageIds();
      expect(result).toEqual([]);
    });

    it("should return empty array for non-array data", () => {
      localStorageMock.setItem("collapsed-media", JSON.stringify({ id: "1" }));
      const result = getCollapsedMessageIds();
      expect(result).toEqual([]);
    });

    it("should return empty array for array with non-string items", () => {
      localStorageMock.setItem("collapsed-media", JSON.stringify([1, 2, 3]));
      const result = getCollapsedMessageIds();
      expect(result).toEqual([]);
    });
  });

  describe("isMediaCollapsed", () => {
    it("should return false when message is not collapsed", () => {
      expect(isMediaCollapsed("msg1")).toBe(false);
    });

    it("should return true when message is collapsed", () => {
      localStorageMock.setItem("collapsed-media", JSON.stringify(["msg1"]));
      expect(isMediaCollapsed("msg1")).toBe(true);
    });

    it("should return false for different message ID", () => {
      localStorageMock.setItem("collapsed-media", JSON.stringify(["msg1"]));
      expect(isMediaCollapsed("msg2")).toBe(false);
    });
  });

  describe("setMediaCollapsed", () => {
    it("should add message ID when collapsed is true", () => {
      setMediaCollapsed("msg1", true);
      expect(isMediaCollapsed("msg1")).toBe(true);
    });

    it("should remove message ID when collapsed is false", () => {
      localStorageMock.setItem("collapsed-media", JSON.stringify(["msg1"]));
      setMediaCollapsed("msg1", false);
      expect(isMediaCollapsed("msg1")).toBe(false);
    });

    it("should not duplicate message ID when setting collapsed multiple times", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg1", true);
      const ids = getCollapsedMessageIds();
      expect(ids.filter((id) => id === "msg1")).toHaveLength(1);
    });

    it("should move message ID to end when re-collapsing (LRU behavior)", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg2", true);
      setMediaCollapsed("msg1", true); // Re-collapse msg1

      const ids = getCollapsedMessageIds();
      expect(ids).toEqual(["msg2", "msg1"]);
    });

    it("should handle multiple collapse/expand operations", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg2", true);
      setMediaCollapsed("msg3", true);
      setMediaCollapsed("msg2", false);

      const ids = getCollapsedMessageIds();
      expect(ids).toEqual(["msg1", "msg3"]);
    });
  });

  describe("clearCollapsedMedia", () => {
    it("should remove all collapsed media state", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg2", true);
      clearCollapsedMedia();

      expect(getCollapsedMessageIds()).toEqual([]);
      expect(isMediaCollapsed("msg1")).toBe(false);
      expect(isMediaCollapsed("msg2")).toBe(false);
    });
  });

  describe("LRU limit enforcement", () => {
    it("should enforce maximum limit on stored IDs", () => {
      // Add more than 500 IDs (the MAX_COLLAPSED_IDS limit)
      for (let i = 0; i < 600; i++) {
        setMediaCollapsed(`msg${i}`, true);
      }

      const ids = getCollapsedMessageIds();
      // Should only keep the most recent 500
      expect(ids.length).toBeLessThanOrEqual(500);
      // Oldest entries should be removed
      expect(ids.includes("msg0")).toBe(false);
      // Most recent entries should be kept
      expect(ids.includes("msg599")).toBe(true);
    });
  });
});
