import { requestPasswordResetFormSchema } from "../request-password-reset";
import { describe, expect, test } from "vitest";

describe("requestPasswordResetFormSchema", () => {
  test("accepts valid email", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email format", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty email", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "",
    });
    expect(result.success).toBe(false);
  });

  test("accepts and trims email with leading/trailing whitespace", () => {
    const result = requestPasswordResetFormSchema.safeParse({
      email: "  user@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  test("rejects missing email field", () => {
    const result = requestPasswordResetFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
