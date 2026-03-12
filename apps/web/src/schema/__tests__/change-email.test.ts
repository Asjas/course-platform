import { changeEmailFormSchema } from "../change-email";
import { describe, expect, test } from "vitest";

describe("changeEmailFormSchema", () => {
  test("accepts valid email", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "newemail@example.com",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email format", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty email", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "",
    });
    expect(result.success).toBe(false);
  });

  test("trims whitespace from email", () => {
    const result = changeEmailFormSchema.safeParse({
      newEmail: "  newemail@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newEmail).toBe("newemail@example.com");
    }
  });

  test("rejects missing newEmail field", () => {
    const result = changeEmailFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
