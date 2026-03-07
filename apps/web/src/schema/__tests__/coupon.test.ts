import { createCouponSchema } from "../create-coupon";
import { editCouponSchema } from "../edit-coupon";
import { describe, expect, test } from "vitest";

describe("createCouponSchema", () => {
  function validData() {
    return {
      active: true,
      code: "SAVE20",
      courseId: null,
      description: null,
      discountType: "percentage" as const,
      discountValue: 20,
      redemptionLimit: 100,
      validFrom: new Date("2025-01-01"),
      validUntil: null,
    };
  }

  test("accepts valid coupon data", () => {
    const result = createCouponSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("accepts percentage discount type", () => {
    const result = createCouponSchema.safeParse({
      ...validData(),
      discountType: "percentage",
    });
    expect(result.success).toBe(true);
  });

  test("accepts fixed discount type", () => {
    const result = createCouponSchema.safeParse({
      ...validData(),
      discountType: "fixed",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid discount type", () => {
    const result = createCouponSchema.safeParse({
      ...validData(),
      discountType: "bogo",
    });
    expect(result.success).toBe(false);
  });

  test("accepts nullable courseId", () => {
    const result = createCouponSchema.safeParse({
      ...validData(),
      courseId: null,
    });
    expect(result.success).toBe(true);
  });

  test("accepts courseId as string", () => {
    const result = createCouponSchema.safeParse({
      ...validData(),
      courseId: "course-1",
    });
    expect(result.success).toBe(true);
  });
});

describe("editCouponSchema", () => {
  function validData() {
    return {
      id: "coupon-1",
      active: true,
      code: "SAVE20",
      courseId: null,
      description: null,
      discountType: "percentage" as const,
      discountValue: 20,
      redemptionLimit: null,
      validFrom: new Date("2025-01-01"),
      validUntil: null,
    };
  }

  test("accepts valid edit coupon data", () => {
    const result = editCouponSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects empty code", () => {
    const result = editCouponSchema.safeParse({ ...validData(), code: "" });
    expect(result.success).toBe(false);
  });

  test("rejects zero discount value", () => {
    const result = editCouponSchema.safeParse({
      ...validData(),
      discountValue: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative discount value", () => {
    const result = editCouponSchema.safeParse({
      ...validData(),
      discountValue: -5,
    });
    expect(result.success).toBe(false);
  });

  test("rejects percentage discount over 100", () => {
    const result = editCouponSchema.safeParse({
      ...validData(),
      discountType: "percentage",
      discountValue: 150,
    });
    expect(result.success).toBe(false);
  });

  test("accepts percentage discount of exactly 100", () => {
    const result = editCouponSchema.safeParse({
      ...validData(),
      discountType: "percentage",
      discountValue: 100,
    });
    expect(result.success).toBe(true);
  });
});
