import { changePasswordFormSchema } from "../change-password";
import { describe, expect, test } from "vitest";

describe("changePasswordFormSchema", () => {
  function validData() {
    return {
      currentPassword: "oldpassword123",
      newPassword: "newpassword456",
    };
  }

  test("accepts valid password change data", () => {
    const result = changePasswordFormSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects currentPassword shorter than 5 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      ...validData(),
      currentPassword: "abc",
    });
    expect(result.success).toBe(false);
  });

  test("rejects currentPassword longer than 80 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      ...validData(),
      currentPassword: "a".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  test("rejects newPassword shorter than 5 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      ...validData(),
      newPassword: "abc",
    });
    expect(result.success).toBe(false);
  });

  test("rejects newPassword longer than 80 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      ...validData(),
      newPassword: "a".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  test("accepts passwords at minimum length boundary (5 chars)", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "abcde",
      newPassword: "fghij",
    });
    expect(result.success).toBe(true);
  });

  test("trims whitespace from passwords", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "  oldpassword  ",
      newPassword: "  newpassword  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentPassword).toBe("oldpassword");
      expect(result.data.newPassword).toBe("newpassword");
    }
  });
});
