import { getAllCoupons, getCouponByCode, getCouponById } from "../queries.js";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      coupon: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
    },
  },
}));

describe("getAllCoupons", () => {
  test("is an exported function", () => {
    expect(typeof getAllCoupons).toBe("function");
  });

  test("returns an array", async () => {
    const result = await getAllCoupons();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getCouponById", () => {
  test("is an exported function", () => {
    expect(typeof getCouponById).toBe("function");
  });

  test("accepts a couponId parameter", async () => {
    const result = await getCouponById({ couponId: "coup:123" });
    expect(result).toBeNull();
  });
});

describe("getCouponByCode", () => {
  test("is an exported function", () => {
    expect(typeof getCouponByCode).toBe("function");
  });

  test("accepts a couponCode parameter", async () => {
    const result = await getCouponByCode({ couponCode: "SAVE20" });
    expect(result).toBeNull();
  });
});
