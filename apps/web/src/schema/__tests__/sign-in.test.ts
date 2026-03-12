import { signInFormSchema } from "../sign-in";
import { describe, expect, test } from "vitest";

describe("signInFormSchema", () => {
  function validData() {
    return {
      email: "user@example.com",
      password: "secure123",
      remember: false,
    };
  }

  test("accepts valid sign-in data", () => {
    const result = signInFormSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("accepts valid email with remember enabled", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      remember: true,
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email format", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty email", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      email: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 5 characters", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      password: "abc",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password longer than 80 characters", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      password: "a".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  test("accepts password at minimum length boundary (5 chars)", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      password: "abcde",
    });
    expect(result.success).toBe(true);
  });

  test("accepts password at maximum length boundary (80 chars)", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      password: "a".repeat(80),
    });
    expect(result.success).toBe(true);
  });

  test("trims whitespace from password", () => {
    const result = signInFormSchema.safeParse({
      ...validData(),
      password: "  secure123  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe("secure123");
    }
  });

  test("rejects missing remember field", () => {
    const data = validData();
    delete (data as Record<string, unknown>).remember;
    const result = signInFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
