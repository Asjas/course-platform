import { couponsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockInsertCoupon,
  mockUpdateCouponById,
  mockDeleteCouponById,
  mockRedeemCouponByCode,
  mockNotifyAdminCouponUsageThreshold,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
  mockStreamEntityUpdates,
} = vi.hoisted(() => ({
  mockInsertCoupon: vi.fn(),
  mockUpdateCouponById: vi.fn(),
  mockDeleteCouponById: vi.fn(),
  mockRedeemCouponByCode: vi.fn(),
  mockNotifyAdminCouponUsageThreshold: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
  mockStreamEntityUpdates: vi.fn(),
}));

vi.mock("~/routers/coupons/mutations.js", () => ({
  insertCoupon: mockInsertCoupon,
  updateCouponById: mockUpdateCouponById,
  deleteCouponById: mockDeleteCouponById,
  redeemCouponByCode: mockRedeemCouponByCode,
}));

vi.mock("~/lib/notifications.js", () => ({
  notifyAdminCouponUsageThreshold: mockNotifyAdminCouponUsageThreshold,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  couponsSyncConfig: { streamKeyPrefix: "sync:coupons" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: mockStreamEntityUpdates,
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  const cache = {
    getAllCoupons: vi.fn(),
    getCouponById: vi.fn(),
    getCouponByCode: vi.fn(),
    invalidateAll: vi.fn(),
  };

  const log = {
    error: vi.fn(),
    debug: vi.fn(),
  };

  const server = {
    cache,
    to: async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
      try {
        const value = await promise;
        return [null, value];
      } catch (error) {
        return [error as Error, null];
      }
    },
  };

  const caller = couponsRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    request: { log },
    reply: { server },
  } as never);

  return { caller, cache, log };
}

describe("couponsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
    mockStreamEntityUpdates.mockReturnValue(
      (async function* () {
        yield { id: "event-1", type: "created", entityId: "coupon-1" };
      })(),
    );
  });

  test("getAll denies non-admin users", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getAll returns cached coupons for admins", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    cache.getAllCoupons.mockResolvedValue([{ id: "coupon-1", code: "SAVE20" }]);

    const result = await caller.getAll();

    expect(result).toEqual([{ id: "coupon-1", code: "SAVE20" }]);
    expect(cache.getAllCoupons).toHaveBeenCalledTimes(1);
  });

  test("getCouponById throws NOT_FOUND when cache/db returns null", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    cache.getCouponById.mockResolvedValue(null);

    await expect(
      caller.getCouponById({ couponId: "coupon-missing" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Coupon not found",
    });
  });

  test("insertCoupon invalidates all coupon list cache keys", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockInsertCoupon.mockResolvedValue({ id: "coupon-2", code: "NEW20" });

    await caller.insertCoupon({
      active: true,
      code: "NEW20",
      courseId: null,
      description: null,
      discountType: "percentage",
      discountValue: 20,
      redemptionLimit: 100,
      validFrom: new Date("2026-03-01T00:00:00.000Z"),
      validUntil: null,
    });

    expect(cache.invalidateAll).toHaveBeenCalledWith(["coupon~all"]);
    expect(mockPublishEntityChange).toHaveBeenCalledTimes(1);
  });

  test("redeemCouponByCode invalidates coupon cache entries", async () => {
    const { caller, cache } = createCaller();

    mockRedeemCouponByCode.mockResolvedValue({ id: "redemption-1" });
    cache.getCouponByCode.mockResolvedValue({
      id: "coupon-3",
      code: "SAVE50",
      redemptions: [],
      redemptionLimit: 10,
    });

    const result = await caller.redeemCouponByCode({
      couponCode: "SAVE50",
      paymentId: "payment-1",
      courseId: "course-1",
    });

    expect(result).toEqual({ id: "redemption-1" });
    expect(cache.invalidateAll).toHaveBeenCalledWith([
      "coupon~all",
      "coupon~code~SAVE50",
      "coupon~id~coupon-3",
    ]);
  });

  test("getUpdatesSince wraps failures as TRPC internal errors", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockGetEntityUpdatesSince.mockRejectedValue(new Error("redis down"));

    await expect(
      caller.getUpdatesSince({ since: Date.now() - 1_000 }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch coupon updates",
    });
  });
});
