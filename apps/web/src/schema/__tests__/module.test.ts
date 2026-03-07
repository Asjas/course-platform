import { createModuleSchema, updateModuleSchema } from "../module";
import { describe, expect, test } from "vitest";

describe("createModuleSchema", () => {
  function validData() {
    return {
      title: "Introduction",
      slug: "introduction",
      description: "Getting started with the course",
      order: 0,
      isPreview: false,
      courseId: "course-1",
    };
  }

  test("accepts valid module data", () => {
    const result = createModuleSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects empty title", () => {
    const result = createModuleSchema.safeParse({ ...validData(), title: "" });
    expect(result.success).toBe(false);
  });

  test("rejects slug with uppercase", () => {
    const result = createModuleSchema.safeParse({
      ...validData(),
      slug: "Introduction",
    });
    expect(result.success).toBe(false);
  });

  test("rejects slug with spaces", () => {
    const result = createModuleSchema.safeParse({
      ...validData(),
      slug: "my module",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty description", () => {
    const result = createModuleSchema.safeParse({
      ...validData(),
      description: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative order", () => {
    const result = createModuleSchema.safeParse({
      ...validData(),
      order: -1,
    });
    expect(result.success).toBe(false);
  });

  test("defaults isPreview to false", () => {
    const data = validData();
    delete (data as Record<string, unknown>).isPreview;
    const result = createModuleSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPreview).toBe(false);
    }
  });
});

describe("updateModuleSchema", () => {
  test("requires id field", () => {
    const result = updateModuleSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(false);
  });

  test("accepts id alone", () => {
    const result = updateModuleSchema.safeParse({ id: "module-1" });
    expect(result.success).toBe(true);
  });

  test("validates slug when provided", () => {
    const result = updateModuleSchema.safeParse({
      id: "module-1",
      slug: "HAS SPACES",
    });
    expect(result.success).toBe(false);
  });

  test("validates order when provided", () => {
    const result = updateModuleSchema.safeParse({
      id: "module-1",
      order: -1,
    });
    expect(result.success).toBe(false);
  });
});
