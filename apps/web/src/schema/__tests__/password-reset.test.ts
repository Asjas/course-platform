import { passwordResetFormSchema } from "../password-reset";
import { describe, expect, test } from "vitest";

describe("passwordResetFormSchema", () => {
  function validData() {
    return {
      password: "newpassword123",
      confirmPassword: "newpassword123",
    };
  }

  test("accepts valid matching passwords", () => {
    const result = passwordResetFormSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects when passwords do not match", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "password123",
      confirmPassword: "differentpassword",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 5 characters", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "abc",
      confirmPassword: "abc",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password longer than 100 characters", () => {
    const longPassword = "a".repeat(101);
    const result = passwordResetFormSchema.safeParse({
      password: longPassword,
      confirmPassword: longPassword,
    });
    expect(result.success).toBe(false);
  });

  test("accepts passwords at minimum length boundary (5 chars)", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "abcde",
      confirmPassword: "abcde",
    });
    expect(result.success).toBe(true);
  });

  test("accepts passwords at maximum length boundary (100 chars)", () => {
    const maxPassword = "a".repeat(100);
    const result = passwordResetFormSchema.safeParse({
      password: maxPassword,
      confirmPassword: maxPassword,
    });
    expect(result.success).toBe(true);
  });

  test("rejects confirmPassword shorter than 5 characters even if matching", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "ab",
      confirmPassword: "ab",
    });
    expect(result.success).toBe(false);
  });

  test("trims whitespace from passwords before matching", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "  mypassword  ",
      confirmPassword: "  mypassword  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe("mypassword");
    }
  });
});
