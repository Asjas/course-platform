import {
  deleteCouponById,
  insertCoupon,
  redeemCouponByCode,
  updateCouponById,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { db } from "~/db/index.js";

vi.mock("~/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "coup:test", code: "SAVE20" }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "coup:test", code: "SAVE20" }]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "coup:test", code: "SAVE20" }]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/coupon.js", () => ({
  coupon: { id: "id" },
  couponRedemption: { id: "id" },
}));

vi.mock("ulid", () => ({
  ulid: vi.fn().mockReturnValue("01HRTEST12345678901234"),
}));

vi.mock("~/routers/coupons/queries.js", () => ({
  preparedGetCouponByCode: {
    execute: vi.fn().mockResolvedValue(null),
  },
}));

const mockDb = vi.mocked(db);

describe("insertCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "coup:01HRTEST12345678901234",
            code: "SAVE20",
            discountPercent: 20,
          },
        ]),
      }),
    } as never);
  });

  test("inserts a coupon with generated ID", async () => {
    const result = await insertCoupon({
      newCoupon: { code: "SAVE20", discountPercent: 20 } as never,
    });

    expect(result).toBeDefined();
    expect(result.code).toBe("SAVE20");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("updateCouponById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([
              { id: "coup:01", code: "SAVE30", discountValue: 30 },
            ]),
        }),
      }),
    } as never);
  });

  test("updates a coupon by ID", async () => {
    const result = await updateCouponById({
      couponId: "coup:01",
      updates: { discountValue: 30 } as never,
    });

    expect(result).toBeDefined();
    expect(result.discountValue).toBe(30);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("deleteCouponById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "coup:01", code: "SAVE20" }]),
      }),
    } as never);
  });

  test("deletes a coupon by ID", async () => {
    const result = await deleteCouponById({ couponId: "coup:01" });

    expect(result).toBeDefined();
    expect(result.id).toBe("coup:01");
    expect(mockDb.delete).toHaveBeenCalled();
  });
});

describe("redeemCouponByCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof redeemCouponByCode).toBe("function");
  });

  test("throws when coupon is not found", async () => {
    await expect(
      redeemCouponByCode({
        couponCode: "INVALID",
        paymentId: "pay:1",
        courseId: "course:1",
      }),
    ).rejects.toThrow("Coupon not found");
  });
});
