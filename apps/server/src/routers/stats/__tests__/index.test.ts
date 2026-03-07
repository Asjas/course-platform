import { statsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

type CacheMethod =
  | "getCourseStats"
  | "getPlatformStats"
  | "getRevenueStats"
  | "getSupportStats"
  | "getUserStats"
  | "getCouponStats"
  | "getTeamLicenseStats"
  | "getProgressStats"
  | "getWishlistStats"
  | "getAnnouncementStats";

type RouterMethod =
  | "getCourseStats"
  | "getPlatformStats"
  | "getRevenueStats"
  | "getSupportStats"
  | "getUserStats"
  | "getCouponStats"
  | "getTeamLicenseStats"
  | "getProgressStats"
  | "getWishlistStats"
  | "getAnnouncementStats";

function createCaller(
  user: { id: string; role: string },
  options?: { fail?: boolean },
) {
  const cache = {
    getCourseStats: vi.fn().mockResolvedValue({ source: "course" }),
    getPlatformStats: vi.fn().mockResolvedValue({ source: "platform" }),
    getRevenueStats: vi.fn().mockResolvedValue({ source: "revenue" }),
    getSupportStats: vi.fn().mockResolvedValue({ source: "support" }),
    getUserStats: vi.fn().mockResolvedValue({ source: "user" }),
    getCouponStats: vi.fn().mockResolvedValue({ source: "coupon" }),
    getTeamLicenseStats: vi.fn().mockResolvedValue({ source: "team" }),
    getProgressStats: vi.fn().mockResolvedValue({ source: "progress" }),
    getWishlistStats: vi.fn().mockResolvedValue({ source: "wishlist" }),
    getAnnouncementStats: vi.fn().mockResolvedValue({ source: "announcement" }),
  };

  const log = {
    error: vi.fn(),
  };

  const to = vi.fn(async (promise: Promise<unknown>) => {
    if (options?.fail) {
      return [new Error("cache failure"), null] as const;
    }
    return [null, await promise] as const;
  });

  const hasRole = (role: string) => user.role === role;

  const caller = statsRouter.createCaller({
    user,
    hasRole,
    reply: {
      server: {
        cache,
        to,
        log,
      },
    },
  } as never);

  return { caller, cache, log, to };
}

describe("statsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const methodMatrix: {
    method: RouterMethod;
    cacheMethod: CacheMethod;
    expectedMessage: string;
  }[] = [
    {
      method: "getCourseStats",
      cacheMethod: "getCourseStats",
      expectedMessage: "Failed to fetch course statistics",
    },
    {
      method: "getPlatformStats",
      cacheMethod: "getPlatformStats",
      expectedMessage: "Failed to fetch platform statistics",
    },
    {
      method: "getRevenueStats",
      cacheMethod: "getRevenueStats",
      expectedMessage: "Failed to fetch revenue statistics",
    },
    {
      method: "getSupportStats",
      cacheMethod: "getSupportStats",
      expectedMessage: "Failed to fetch support statistics",
    },
    {
      method: "getUserStats",
      cacheMethod: "getUserStats",
      expectedMessage: "Failed to fetch user statistics",
    },
    {
      method: "getCouponStats",
      cacheMethod: "getCouponStats",
      expectedMessage: "Failed to fetch coupon statistics",
    },
    {
      method: "getTeamLicenseStats",
      cacheMethod: "getTeamLicenseStats",
      expectedMessage: "Failed to fetch team license statistics",
    },
    {
      method: "getProgressStats",
      cacheMethod: "getProgressStats",
      expectedMessage: "Failed to fetch progress statistics",
    },
    {
      method: "getWishlistStats",
      cacheMethod: "getWishlistStats",
      expectedMessage: "Failed to fetch wishlist statistics",
    },
    {
      method: "getAnnouncementStats",
      cacheMethod: "getAnnouncementStats",
      expectedMessage: "Failed to fetch announcement statistics",
    },
  ];

  for (const { method, cacheMethod, expectedMessage } of methodMatrix) {
    test(`${method} returns cached stats on success`, async () => {
      const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });

      const result = await caller[method]();

      expect(cache[cacheMethod]).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        expect.objectContaining({ source: expect.any(String) }),
      );
    });

    test(`${method} logs and throws when cache fails`, async () => {
      const { caller, log } = createCaller(
        { id: "admin-1", role: "admin" },
        { fail: true },
      );

      await expect(caller[method]()).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        message: expectedMessage,
      });

      expect(log.error).toHaveBeenCalledTimes(1);
    });
  }

  test("all methods deny non-admin callers", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });

    for (const { method } of methodMatrix) {
      await expect(caller[method]()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    }
  });
});
