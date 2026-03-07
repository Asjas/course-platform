import { changeEmailFormSchema } from "../change-email";
import { changePasswordFormSchema } from "../change-password";
import { passwordResetFormSchema } from "../password-reset";
import { requestPasswordResetFormSchema } from "../request-password-reset";
import { signInFormSchema } from "../sign-in";
import { describe, expect, test } from "vitest";

describe("signInFormSchema", () => {
  test("accepts valid sign-in data", () => {
    const result = signInFormSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      remember: true,
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = signInFormSchema.safeParse({
      email: "not-email",
      password: "password123",
      remember: false,
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 5 characters", () => {
    const result = signInFormSchema.safeParse({
      email: "user@example.com",
      password: "1234",
      remember: false,
    });
    expect(result.success).toBe(false);
  });

  test("rejects password longer than 80 characters", () => {
    const result = signInFormSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(81),
      remember: false,
    });
    expect(result.success).toBe(false);
  });

  test("requires remember field", () => {
    const result = signInFormSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordFormSchema", () => {
  test("accepts valid password change", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "oldPass123",
      newPassword: "newPass456",
    });
    expect(result.success).toBe(true);
  });

  test("rejects currentPassword shorter than 5 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "1234",
      newPassword: "newPass456",
    });
    expect(result.success).toBe(false);
  });

  test("rejects newPassword shorter than 5 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "oldPass123",
      newPassword: "1234",
    });
    expect(result.success).toBe(false);
  });

  test("rejects passwords longer than 80 characters", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "a".repeat(81),
      newPassword: "newPass456",
    });
    expect(result.success).toBe(false);
  });
});

describe("changeEmailFormSchema", () => {
  test("accepts valid email", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "new@example.com",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("trims whitespace", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "  new@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newEmail).toBe("new@example.com");
    }
  });
});

describe("requestPasswordResetFormSchema", () => {
  test("accepts valid email", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("passwordResetFormSchema", () => {
  test("accepts valid matching passwords", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "newPassword123",
      confirmPassword: "newPassword123",
    });
    expect(result.success).toBe(true);
  });

  test("rejects mismatched passwords", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "newPassword123",
      confirmPassword: "differentPassword",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 5 characters", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "1234",
      confirmPassword: "1234",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password longer than 100 characters", () => {
    const longPass = "a".repeat(101);
    const result = passwordResetFormSchema.safeParse({
      password: longPass,
      confirmPassword: longPass,
    });
    expect(result.success).toBe(false);
  });
});
