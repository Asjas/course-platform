import {
  type EntitySyncConfig,
  announcementsSyncConfig,
  createSyncUpdate,
  getEntityStreamKey,
  getEntityUpdatesSince,
  isStreamIdAfter,
  publishEntityChange,
  safeJsonParse,
} from "../sse-sync.js";
import { describe, expect, test, vi } from "vitest";

const { mockDebug, mockError, mockXadd, mockXrange, mockUlid } = vi.hoisted(
  () => ({
    mockDebug: vi.fn(),
    mockError: vi.fn(),
    mockXadd: vi.fn(),
    mockXrange: vi.fn(),
    mockUlid: vi.fn(() => "01TESTULID00000000000000000"),
  }),
);

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: { child: () => ({ debug: mockDebug, error: mockError }) },
}));
vi.mock("~/lib/redis.js", () => ({
  redis: {
    xadd: mockXadd,
    xrange: mockXrange,
  },
  subscriptionRedis: {},
}));
vi.mock("ulid", () => ({
  ulid: mockUlid,
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

describe("publishEntityChange", () => {
  test("publishes with default max length", async () => {
    mockXadd.mockResolvedValue("1741560000000-0");

    const config: EntitySyncConfig = { streamKeyPrefix: "sync:test" };
    const update = {
      id: "u1",
      type: "created" as const,
      data: { id: "entity1" },
      entityId: "entity1",
      timestamp: 123,
    };

    const streamId = await publishEntityChange(config, update);

    expect(streamId).toBe("1741560000000-0");
    expect(mockXadd).toHaveBeenCalledWith(
      "sync:test",
      "MAXLEN",
      "~",
      "10000",
      "*",
      "data",
      JSON.stringify(update),
    );
  });

  test("publishes with custom max length and scope", async () => {
    mockXadd.mockResolvedValue("1741560000001-0");

    const config: EntitySyncConfig = {
      streamKeyPrefix: "sync:test",
      maxStreamLength: 250,
    };

    await publishEntityChange(
      config,
      {
        id: "u2",
        type: "updated",
        data: { id: "entity2" },
        entityId: "entity2",
        timestamp: 456,
      },
      "user-1",
    );

    expect(mockXadd).toHaveBeenCalledWith(
      "sync:test:user-1",
      "MAXLEN",
      "~",
      "250",
      "*",
      "data",
      expect.any(String),
    );
  });

  test("throws when xadd returns no stream id", async () => {
    mockXadd.mockResolvedValue(null);

    await expect(
      publishEntityChange(
        { streamKeyPrefix: "sync:test" },
        {
          id: "u3",
          type: "deleted",
          data: null,
          entityId: "entity3",
          timestamp: 789,
        },
      ),
    ).rejects.toThrow("Failed to add entry to stream");
  });
});

describe("getEntityUpdatesSince", () => {
  test("returns parsed updates and skips corrupted entries", async () => {
    const valid = {
      id: "up-1",
      type: "created" as const,
      data: { id: "1" },
      entityId: "1",
      timestamp: 1000,
    };

    mockXrange.mockResolvedValue([
      ["1000-0", ["data", JSON.stringify(valid)]],
      ["1001-0", ["data", "{not-json"]],
    ]);

    const updates = await getEntityUpdatesSince(
      { streamKeyPrefix: "sync:test" },
      1000,
      "scope-a",
    );

    expect(mockXrange).toHaveBeenCalledWith("sync:test:scope-a", "1000-0", "+");
    expect(updates).toEqual([valid]);
  });

  test("rethrows redis errors", async () => {
    mockXrange.mockRejectedValue(new Error("redis down"));

    await expect(
      getEntityUpdatesSince({ streamKeyPrefix: "sync:test" }, 1),
    ).rejects.toThrow("redis down");
  });
});

describe("createSyncUpdate", () => {
  test("creates update envelope with generated id and timestamp", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1735689600000);

    const result = createSyncUpdate("created", "entity-1", { a: 1 }, "actor-1");

    expect(result).toEqual({
      id: "01TESTULID00000000000000000",
      type: "created",
      data: { a: 1 },
      entityId: "entity-1",
      timestamp: 1735689600000,
      actorId: "actor-1",
    });

    nowSpy.mockRestore();
  });
});

describe("pre-configured sync configs", () => {
  test("exports expected announcements sync config", () => {
    expect(announcementsSyncConfig).toEqual({
      streamKeyPrefix: "sync:announcements",
      maxStreamLength: 10000,
    });
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
