import { checkExportRateLimit } from "../rateLimit.js";
import { TRPCError } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { redis } from "~/lib/redis.js";

// Mock redis before importing the module
vi.mock("~/lib/redis.js", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}));

const mockedRedis = vi.mocked(redis);

describe("checkExportRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("allows first request (count=1) and sets expiry", async () => {
    mockedRedis.incr.mockResolvedValue(1);
    mockedRedis.expire.mockResolvedValue(1);

    await expect(checkExportRateLimit("user-1")).resolves.toBeUndefined();

    expect(mockedRedis.incr).toHaveBeenCalledWith(
      "codewizard-rate-limit-data-export:user-1",
    );
    expect(mockedRedis.expire).toHaveBeenCalledWith(
      "codewizard-rate-limit-data-export:user-1",
      3600,
    );
  });

  test("allows second request without setting expiry again", async () => {
    mockedRedis.incr.mockResolvedValue(2);

    await expect(checkExportRateLimit("user-2")).resolves.toBeUndefined();

    expect(mockedRedis.expire).not.toHaveBeenCalled();
  });

  test("allows third request (at the limit)", async () => {
    mockedRedis.incr.mockResolvedValue(3);

    await expect(checkExportRateLimit("user-3")).resolves.toBeUndefined();
  });

  test("throws TOO_MANY_REQUESTS when count exceeds limit", async () => {
    mockedRedis.incr.mockResolvedValue(4);
    mockedRedis.ttl.mockResolvedValue(1800);

    try {
      await checkExportRateLimit("user-4");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      const trpcError = error as TRPCError;
      expect(trpcError.code).toBe("TOO_MANY_REQUESTS");
      expect(trpcError.message).toContain("Rate limit exceeded");
      expect(trpcError.message).toContain("30 minutes");
    }
  });

  test("uses singular 'minute' when TTL rounds to 1", async () => {
    mockedRedis.incr.mockResolvedValue(5);
    mockedRedis.ttl.mockResolvedValue(30);

    try {
      await checkExportRateLimit("user-5");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      const trpcError = error as TRPCError;
      expect(trpcError.message).toContain("1 minute.");
    }
  });

  test("does not block export when Redis connection fails", async () => {
    mockedRedis.incr.mockRejectedValue(new Error("Redis connection error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());

    await expect(checkExportRateLimit("user-6")).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("rethrows TRPCError even when caught", async () => {
    mockedRedis.incr.mockResolvedValue(10);
    mockedRedis.ttl.mockResolvedValue(3600);

    await expect(checkExportRateLimit("user-7")).rejects.toThrow(TRPCError);
  });

  test("uses correct Redis key format with userId", async () => {
    mockedRedis.incr.mockResolvedValue(1);
    mockedRedis.expire.mockResolvedValue(1);

    await checkExportRateLimit("user-abc-123");

    expect(mockedRedis.incr).toHaveBeenCalledWith(
      "codewizard-rate-limit-data-export:user-abc-123",
    );
  });
});
