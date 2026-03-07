import { profileFormSchema, usernameOnlySchema } from "../profile-form";
import { describe, expect, test } from "vitest";

describe("profileFormSchema", () => {
  test("accepts valid profile data", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      username: "johndoe",
      color: "#FF5733",
      image: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  test("rejects name shorter than 3 characters", () => {
    const result = profileFormSchema.safeParse({ name: "Jo" });
    expect(result.success).toBe(false);
  });

  test("transforms empty username to null", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      username: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBeNull();
    }
  });

  test("rejects username shorter than 3 characters (non-empty)", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  test("accepts null username", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      username: null,
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid hex color", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      color: "red",
    });
    expect(result.success).toBe(false);
  });

  test("accepts valid hex color", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      color: "#aaBB00",
    });
    expect(result.success).toBe(true);
  });

  test("rejects non-http image URL", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      image: "ftp://example.com/avatar.png",
    });
    expect(result.success).toBe(false);
  });

  test("accepts null color and image", () => {
    const result = profileFormSchema.safeParse({
      name: "John Doe",
      color: null,
      image: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("usernameOnlySchema", () => {
  test("accepts valid username", () => {
    const result = usernameOnlySchema.safeParse({ username: "john_doe-123" });
    expect(result.success).toBe(true);
  });

  test("rejects username shorter than 3 characters", () => {
    const result = usernameOnlySchema.safeParse({ username: "ab" });
    expect(result.success).toBe(false);
  });

  test("rejects username longer than 32 characters", () => {
    const result = usernameOnlySchema.safeParse({
      username: "a".repeat(33),
    });
    expect(result.success).toBe(false);
  });

  test("rejects username with special characters", () => {
    const result = usernameOnlySchema.safeParse({ username: "john.doe" });
    expect(result.success).toBe(false);
  });

  test("accepts username with underscores and hyphens", () => {
    const result = usernameOnlySchema.safeParse({ username: "john_doe-123" });
    expect(result.success).toBe(true);
  });
});
