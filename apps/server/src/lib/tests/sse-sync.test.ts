import {
  type EntitySyncConfig,
  getEntityStreamKey,
  isStreamIdAfter,
  safeJsonParse,
} from "../sse-sync.js";
import { describe, expect, test, vi } from "vitest";

// Mock logging to avoid noise in tests
vi.mock("~/lib/logging.js", () => ({
  pinoLogger: { child: () => ({ debug: vi.fn(), error: vi.fn() }) },
}));
vi.mock("~/lib/redis.js", () => ({
  redis: {},
  subscriptionRedis: {},
}));

describe("getEntityStreamKey", () => {
  const config: EntitySyncConfig = {
    streamKeyPrefix: "sync:announcements",
  };

  test("returns prefix only when no scope provided", () => {
    expect(getEntityStreamKey(config)).toBe("sync:announcements");
  });

  test("returns prefix:scope when scope provided", () => {
    expect(getEntityStreamKey(config, "user123")).toBe(
      "sync:announcements:user123",
    );
  });

  test("returns prefix only when scope is undefined", () => {
    expect(getEntityStreamKey(config, undefined)).toBe("sync:announcements");
  });

  test("returns prefix only when scope is empty string", () => {
    // Empty string is falsy, so it should return prefix only
    expect(getEntityStreamKey(config, "")).toBe("sync:announcements");
  });
});

describe("safeJsonParse", () => {
  test("parses valid JSON", () => {
    const result = safeJsonParse<{ name: string }>('{"name":"test"}');
    expect(result).toEqual({ name: "test" });
  });

  test("returns null for invalid JSON", () => {
    const result = safeJsonParse("not json");
    expect(result).toBeNull();
  });

  test("returns null for empty string", () => {
    const result = safeJsonParse("");
    expect(result).toBeNull();
  });

  test("parses arrays", () => {
    const result = safeJsonParse<number[]>("[1,2,3]");
    expect(result).toEqual([1, 2, 3]);
  });

  test("parses primitives", () => {
    expect(safeJsonParse<number>("42")).toBe(42);
    expect(safeJsonParse<string>('"hello"')).toBe("hello");
    expect(safeJsonParse<boolean>("true")).toBe(true);
    expect(safeJsonParse<null>("null")).toBeNull();
  });

  test("returns null for truncated JSON", () => {
    const result = safeJsonParse('{"name":"te');
    expect(result).toBeNull();
  });

  test("accepts optional context parameter without affecting result", () => {
    const valid = safeJsonParse<{ id: number }>('{"id":1}', "test-context");
    expect(valid).toEqual({ id: 1 });

    const invalid = safeJsonParse("bad", "test-context");
    expect(invalid).toBeNull();
  });
});

describe("isStreamIdAfter", () => {
  test("returns true when previous is $", () => {
    expect(isStreamIdAfter("1234-0", "$")).toBe(true);
  });

  test("returns true when previous is 0", () => {
    expect(isStreamIdAfter("1234-0", "0")).toBe(true);
  });

  test("returns true when current time is greater", () => {
    expect(isStreamIdAfter("2000-0", "1000-0")).toBe(true);
  });

  test("returns false when current time is less", () => {
    expect(isStreamIdAfter("1000-0", "2000-0")).toBe(false);
  });

  test("returns true when times equal but sequence is greater", () => {
    expect(isStreamIdAfter("1000-5", "1000-3")).toBe(true);
  });

  test("returns false when times equal but sequence is less", () => {
    expect(isStreamIdAfter("1000-3", "1000-5")).toBe(false);
  });

  test("returns false when times and sequences are equal", () => {
    expect(isStreamIdAfter("1000-3", "1000-3")).toBe(false);
  });
});
