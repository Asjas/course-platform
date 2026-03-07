import { createCourseSchema, updateCourseSchema } from "../course";
import { describe, expect, test } from "vitest";

describe("createCourseSchema", () => {
  function validData() {
    return {
      slug: "learn-fastify",
      name: "Learn Fastify",
      description: null,
      level: "Beginner" as const,
      thumbnailUrl: null,
      published: false,
      isFree: false,
      price: 4999,
      priceCurrency: "USD",
      isSaleActive: false,
      salePrice: 0,
      saleStartAt: null,
      saleExpiresAt: null,
      trialModuleLimit: 0,
      authorId: "author-1",
    };
  }

  test("accepts valid course data", () => {
    const result = createCourseSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects empty slug", () => {
    const result = createCourseSchema.safeParse({ ...validData(), slug: "" });
    expect(result.success).toBe(false);
  });

  test("rejects slug with uppercase", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      slug: "Learn-Fastify",
    });
    expect(result.success).toBe(false);
  });

  test("rejects slug with spaces", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      slug: "learn fastify",
    });
    expect(result.success).toBe(false);
  });

  test("accepts valid slug with hyphens and numbers", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      slug: "learn-fastify-2",
    });
    expect(result.success).toBe(true);
  });

  test.each(["All levels", "Beginner", "Intermediate", "Advanced"])(
    "accepts level '%s'",
    (level) => {
      const result = createCourseSchema.safeParse({
        ...validData(),
        level,
      });
      expect(result.success).toBe(true);
    },
  );

  test("rejects invalid level", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      level: "Expert",
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative price", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      price: -1,
    });
    expect(result.success).toBe(false);
  });

  test("accepts zero price", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      price: 0,
    });
    expect(result.success).toBe(true);
  });

  test("rejects non-integer price", () => {
    const result = createCourseSchema.safeParse({
      ...validData(),
      price: 49.99,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCourseSchema", () => {
  test("requires id field", () => {
    const result = updateCourseSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(false);
  });

  test("accepts id with only optional fields", () => {
    const result = updateCourseSchema.safeParse({
      id: "course-1",
      name: "Updated",
    });
    expect(result.success).toBe(true);
  });

  test("accepts id alone", () => {
    const result = updateCourseSchema.safeParse({ id: "course-1" });
    expect(result.success).toBe(true);
  });

  test("validates slug when provided", () => {
    const result = updateCourseSchema.safeParse({
      id: "course-1",
      slug: "UPPERCASE",
    });
    expect(result.success).toBe(false);
  });
});
