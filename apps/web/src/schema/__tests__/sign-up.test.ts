import { signUpFormSchema } from "../sign-up";
import { describe, expect, test } from "vitest";

describe("signUpFormSchema", () => {
  function validData() {
    return {
      name: "John Doe",
      email: "john@example.com",
      password: "securePass123",
      confirmPassword: "securePass123",
    };
  }

  test("accepts valid sign-up data", () => {
    const result = signUpFormSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects name shorter than 2 characters", () => {
    const result = signUpFormSchema.safeParse({ ...validData(), name: "J" });
    expect(result.success).toBe(false);
  });

  test("accepts name with exactly 2 characters", () => {
    const result = signUpFormSchema.safeParse({ ...validData(), name: "Jo" });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = signUpFormSchema.safeParse({
      ...validData(),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 5 characters", () => {
    const result = signUpFormSchema.safeParse({
      ...validData(),
      password: "1234",
      confirmPassword: "1234",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password longer than 80 characters", () => {
    const longPass = "a".repeat(81);
    const result = signUpFormSchema.safeParse({
      ...validData(),
      password: longPass,
      confirmPassword: longPass,
    });
    expect(result.success).toBe(false);
  });

  test("rejects mismatched passwords", () => {
    const result = signUpFormSchema.safeParse({
      ...validData(),
      password: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
  });

  test("trims whitespace from fields", () => {
    const result = signUpFormSchema.safeParse({
      ...validData(),
      name: "  John Doe  ",
      email: "  john@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
    }
  });
});
