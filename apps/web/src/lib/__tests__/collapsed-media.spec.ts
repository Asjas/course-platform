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
    const getItem = vi.fn((key: string) => store[key] ?? null);
    const setItem = vi.fn((key: string, value: string) => {
      store[key] = value;
    });
    const removeItem = vi.fn((key: string) => {
      const { [key]: _removed, ...rest } = store;
      void _removed;
      store = rest;
    });
    const clear = vi.fn(() => {
      store = {};
    });
    const key = vi.fn((index: number) => Object.keys(store)[index] ?? null);

    const reset = () => {
      store = {};
      getItem.mockReset();
      setItem.mockReset();
      removeItem.mockReset();
      clear.mockReset();
      key.mockReset();

      getItem.mockImplementation(
        (storageKey: string) => store[storageKey] ?? null,
      );
      setItem.mockImplementation((storageKey: string, value: string) => {
        store[storageKey] = value;
      });
      removeItem.mockImplementation((storageKey: string) => {
        const { [storageKey]: _removed, ...rest } = store;
        void _removed;
        store = rest;
      });
      clear.mockImplementation(() => {
        store = {};
      });
      key.mockImplementation(
        (index: number) => Object.keys(store)[index] ?? null,
      );
    };

    return {
      getItem,
      setItem,
      removeItem,
      clear,
      get length() {
        return Object.keys(store).length;
      },
      key,
      reset,
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.reset();
    vi.stubGlobal("localStorage", localStorageMock as unknown as Storage);
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

    it("should return empty array when localStorage.getItem throws", () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("storage read failed");
      });

      const result = getCollapsedMessageIds();
      expect(result).toEqual([]);
    });

    it("should return empty array for mixed-type array", () => {
      localStorageMock.setItem(
        "collapsed-media",
        JSON.stringify(["msg1", 2, "msg3"]),
      );

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

    it("should keep existing state when expanding non-collapsed message", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg2", true);
      setMediaCollapsed("msg3", false);

      expect(getCollapsedMessageIds()).toEqual(["msg1", "msg2"]);
    });

    it("should preserve other IDs when removing one message", () => {
      setMediaCollapsed("msg1", true);
      setMediaCollapsed("msg2", true);
      setMediaCollapsed("msg3", true);

      setMediaCollapsed("msg2", false);

      expect(getCollapsedMessageIds()).toEqual(["msg1", "msg3"]);
    });

    it("should retry with reduced list when first localStorage write fails", () => {
      const originalSetItem = localStorageMock.setItem.getMockImplementation();

      const setItemSpy = vi
        .spyOn(localStorageMock, "setItem")
        .mockImplementation((key: string, value: string) => {
          const parsed: unknown = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length === 500) {
            throw new Error("quota exceeded");
          }

          originalSetItem?.(key, value);
        });

      for (let i = 0; i < 600; i++) {
        setMediaCollapsed(`msg${i}`, true);
      }

      expect(setItemSpy).toHaveBeenCalled();
      const persisted = getCollapsedMessageIds();
      expect(persisted).toHaveLength(350);
      expect(persisted.includes("msg599")).toBe(true);
      expect(persisted.includes("msg0")).toBe(false);
    });

    it("should clear collapsed state when both write attempts fail", () => {
      const setItemSpy = vi
        .spyOn(localStorageMock, "setItem")
        .mockImplementation(() => {
          throw new Error("storage failure");
        });

      const removeItemSpy = vi.spyOn(localStorageMock, "removeItem");

      setMediaCollapsed("msg1", true);

      expect(setItemSpy).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith("collapsed-media");
      expect(getCollapsedMessageIds()).toEqual([]);
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

    it("should not throw when localStorage.removeItem fails", () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error("remove failed");
      });

      expect(() => clearCollapsedMedia()).not.toThrow();
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

    it("should keep exactly 500 IDs when exactly at the limit", () => {
      for (let i = 0; i < 500; i++) {
        setMediaCollapsed(`msg${i}`, true);
      }

      const ids = getCollapsedMessageIds();
      expect(ids).toHaveLength(500);
      expect(ids[0]).toBe("msg0");
      expect(ids[499]).toBe("msg499");
    });

    it("should evict oldest ID when adding the 501st item", () => {
      for (let i = 0; i < 501; i++) {
        setMediaCollapsed(`msg${i}`, true);
      }

      const ids = getCollapsedMessageIds();
      expect(ids).toHaveLength(500);
      expect(ids.includes("msg0")).toBe(false);
      expect(ids.includes("msg500")).toBe(true);
    });
  });

  describe("SSR safety", () => {
    it("should return empty IDs when window is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("window", undefined);

      expect(getCollapsedMessageIds()).toEqual([]);
    });

    it("should no-op for set and clear when window is undefined", () => {
      vi.unstubAllGlobals();
      vi.stubGlobal("window", undefined);

      expect(() => setMediaCollapsed("msg1", true)).not.toThrow();
      expect(() => clearCollapsedMedia()).not.toThrow();
    });
  });
});
