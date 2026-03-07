import { editUserSchema } from "../edit-user";
import {
  refundPurchaseSchema,
  refundReasonOptions,
  refundReasonSchema,
} from "../refund-purchase";
import { describe, expect, test } from "vitest";

describe("refundReasonSchema", () => {
  test.each([
    "duplicate",
    "fraudulent",
    "customer_request",
    "service_disruption",
    "satisfaction_guarantee",
    "dispute_prevention",
    "other",
  ])("accepts reason '%s'", (reason) => {
    const result = refundReasonSchema.safeParse(reason);
    expect(result.success).toBe(true);
  });

  test("rejects invalid reason", () => {
    const result = refundReasonSchema.safeParse("unknown_reason");
    expect(result.success).toBe(false);
  });

  test("refundReasonOptions matches schema values", () => {
    for (const option of refundReasonOptions) {
      const result = refundReasonSchema.safeParse(option.value);
      expect(result.success).toBe(true);
    }
  });
});

describe("refundPurchaseSchema", () => {
  test("accepts valid refund data", () => {
    const result = refundPurchaseSchema.safeParse({
      orderId: "order-123",
      reason: "customer_request",
      comment: "Changed my mind",
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty orderId", () => {
    const result = refundPurchaseSchema.safeParse({
      orderId: "",
      reason: "customer_request",
      comment: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid reason", () => {
    const result = refundPurchaseSchema.safeParse({
      orderId: "order-123",
      reason: "invalid",
      comment: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("editUserSchema", () => {
  function validData() {
    return {
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      emailVerified: true,
      role: "member" as const,
      banned: false,
    };
  }

  test("accepts valid user data", () => {
    const result = editUserSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects empty name", () => {
    const result = editUserSchema.safeParse({ ...validData(), name: "" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      email: "not-email",
    });
    expect(result.success).toBe(false);
  });

  test.each(["member", "admin"])("accepts role '%s'", (role) => {
    const result = editUserSchema.safeParse({ ...validData(), role });
    expect(result.success).toBe(true);
  });

  test("rejects invalid role", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  test("accepts optional fields", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      username: "johndoe",
      color: "#FF5733",
      banReason: "Spam",
      banExpires: "2025-12-31",
    });
    expect(result.success).toBe(true);
  });
});
