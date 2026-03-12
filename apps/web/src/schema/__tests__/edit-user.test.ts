import { editUserSchema } from "../edit-user";
import { describe, expect, test } from "vitest";

describe("editUserSchema", () => {
  function validData() {
    return {
      userId: "user:1",
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

  test("accepts admin role", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid role", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty name", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      name: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email format", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("accepts optional username", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      username: "johndoe",
    });
    expect(result.success).toBe(true);
  });

  test("accepts optional color", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      color: "#ff5733",
    });
    expect(result.success).toBe(true);
  });

  test("accepts banned user with ban reason and expiry", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      banned: true,
      banReason: "Spamming",
      banExpires: "2026-12-31T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing required email field", () => {
    const data = validData();
    delete (data as Record<string, unknown>).email;
    const result = editUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test("accepts optional fields as undefined", () => {
    const result = editUserSchema.safeParse({
      ...validData(),
      username: undefined,
      color: undefined,
      banReason: undefined,
      banExpires: undefined,
    });
    expect(result.success).toBe(true);
  });
});
