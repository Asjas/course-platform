import { beforeEach, describe, expect, it, vi } from "vitest";
// Now import the module under test (uses mocked redis)
import * as query from "~/db/query.js";
import { ONE_HOUR } from "~/lib/constants.js";

// Mock Redis before importing the module under test
vi.mock("~/lib/redis.js", () => {
  const get = vi.fn();
  const set = vi.fn();
  const del = vi.fn();
  return {
    redis: {
      get,
      set,
      del,
    },
  };
});

// Import the mocked redis after the mock is set up
const { redis } = await import("~/lib/redis.js");

// Type assertion to access mock methods
const mockRedis = vi.mocked(redis);

beforeEach(() => {
  // reset redis mocks
  mockRedis.get.mockReset();
  mockRedis.set.mockReset();
  mockRedis.del.mockReset();

  // reset prepared query execute mocks if present
  if ((query.selectUserById as any)?.execute) {
    (query.selectUserById as any).execute = vi.fn();
  }
  if ((query.selectSessionByToken as any)?.execute) {
    (query.selectSessionByToken as any).execute = vi.fn();
  }
  if ((query.selectSessionsByUserId as any)?.execute) {
    (query.selectSessionsByUserId as any).execute = vi.fn();
  }
});

describe("selectUserByIdCached", () => {
  it("returns Redis value when cached and does not call DB", async () => {
    const payload = { id: "u1", email: "a@b.com" };
    mockRedis.get.mockResolvedValue(JSON.stringify(payload));

    const res = await query.selectUserByIdCached("u1");

    expect(mockRedis.get).toHaveBeenCalledWith("user:u1");
    expect((query.selectUserById as any).execute).not.toHaveBeenCalled();
    expect(res).toEqual(payload);
  });

  it("falls back to DB and writes cache when missing", async () => {
    const dbValue = { id: "u2", email: "db@b.com" };
    mockRedis.get.mockResolvedValue(null);
    (query.selectUserById as any).execute = vi.fn().mockResolvedValue(dbValue);

    const res = await query.selectUserByIdCached("u2");

    expect(mockRedis.get).toHaveBeenCalledWith("user:u2");
    expect((query.selectUserById as any).execute).toHaveBeenCalledWith({
      id: "u2",
    });
    expect(mockRedis.set).toHaveBeenCalledWith(
      "user:u2",
      JSON.stringify(dbValue),
      "EX",
      ONE_HOUR,
    );
    expect(res).toEqual(dbValue);
  });
});

describe("selectSessionByTokenCached", () => {
  it("returns cached session and does not call DB", async () => {
    const sess = { id: "s1", token: "t1", userId: "u1" };
    mockRedis.get.mockResolvedValue(JSON.stringify(sess));

    const res = await query.selectSessionByTokenCached("t1");

    expect(mockRedis.get).toHaveBeenCalledWith("session:t1");
    expect((query.selectSessionByToken as any).execute).not.toHaveBeenCalled();
    expect(res).toEqual(sess);
  });

  it("falls back to DB when cache miss and caches session when DB returns object", async () => {
    const dbSess = { id: "s2", token: "t2", userId: "u2" };
    mockRedis.get.mockResolvedValue(null);
    (query.selectSessionByToken as any).execute = vi
      .fn()
      .mockResolvedValue(dbSess);

    const res = await query.selectSessionByTokenCached("t2");

    expect(mockRedis.get).toHaveBeenCalledWith("session:t2");
    expect((query.selectSessionByToken as any).execute).toHaveBeenCalledWith({
      token: "t2",
    });
    expect(mockRedis.set).toHaveBeenCalledWith(
      "session:t2",
      JSON.stringify(dbSess),
      "EX",
      ONE_HOUR,
    );
    expect(res).toEqual(dbSess);
  });

  it("returns null and does NOT cache when DB returns empty array", async () => {
    mockRedis.get.mockResolvedValue(null);
    (query.selectSessionByToken as any).execute = vi.fn().mockResolvedValue([]);

    const res = await query.selectSessionByTokenCached("nope");

    expect(mockRedis.get).toHaveBeenCalledWith("session:nope");
    expect((query.selectSessionByToken as any).execute).toHaveBeenCalledWith({
      token: "nope",
    });
    expect(mockRedis.set).not.toHaveBeenCalled(); // should not cache null
    expect(res).toBeNull();
  });
});

describe("selectSessionsByUserIdCached", () => {
  it("returns cached sessions when Redis has them", async () => {
    const cached = [{ id: "s1" }, { id: "s2" }];
    mockRedis.get.mockResolvedValue(JSON.stringify(cached));

    const res = await query.selectSessionsByUserIdCached("u-cache");

    expect(mockRedis.get).toHaveBeenCalledWith("sessions:user:u-cache");
    expect(
      (query.selectSessionsByUserId as any).execute,
    ).not.toHaveBeenCalled();
    expect(res).toEqual(cached);
  });

  it("normalizes single DB result into an array and caches it", async () => {
    const single = { id: "s-single", token: "t-single" };
    mockRedis.get.mockResolvedValue(null);
    // DB returns a single object (not an array)
    (query.selectSessionsByUserId as any).execute = vi
      .fn()
      .mockResolvedValue(single);

    const res = await query.selectSessionsByUserIdCached("u-single");

    expect((query.selectSessionsByUserId as any).execute).toHaveBeenCalledWith({
      userId: "u-single",
    });
    expect(mockRedis.set).toHaveBeenCalledWith(
      "sessions:user:u-single",
      JSON.stringify([single]),
      "EX",
      ONE_HOUR,
    );
    expect(res).toEqual([single]);
  });

  it("caches empty array when DB returns []", async () => {
    mockRedis.get.mockResolvedValue(null);
    (query.selectSessionsByUserId as any).execute = vi
      .fn()
      .mockResolvedValue([]);

    const res = await query.selectSessionsByUserIdCached("u-empty");

    expect((query.selectSessionsByUserId as any).execute).toHaveBeenCalledWith({
      userId: "u-empty",
    });
    expect(mockRedis.set).toHaveBeenCalledWith(
      "sessions:user:u-empty",
      JSON.stringify([]),
      "EX",
      ONE_HOUR,
    );
    expect(res).toEqual([]);
  });
});
