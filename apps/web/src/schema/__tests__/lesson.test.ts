import { createLessonSchema, updateLessonSchema } from "../lesson";
import { describe, expect, test } from "vitest";

describe("createLessonSchema", () => {
  function validData() {
    return {
      title: "Getting Started",
      slug: "getting-started",
      videoUrl: "https://youtube.com/watch?v=abc123",
      videoProvider: "youtube" as const,
      content: {},
      transcription: {},
      duration: null,
      order: 0,
      isPreview: false,
      courseId: "course-1",
      moduleId: "module-1",
    };
  }

  test("accepts valid lesson data", () => {
    const result = createLessonSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects empty title", () => {
    const result = createLessonSchema.safeParse({ ...validData(), title: "" });
    expect(result.success).toBe(false);
  });

  test("rejects slug with uppercase", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      slug: "Getting-Started",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid video URL", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      videoUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid video provider", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      videoProvider: "vimeo",
    });
    expect(result.success).toBe(false);
  });

  test("defaults videoProvider to youtube", () => {
    const data = validData();
    delete (data as Record<string, unknown>).videoProvider;
    const result = createLessonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.videoProvider).toBe("youtube");
    }
  });

  test("rejects negative order", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      order: -1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-integer order", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      order: 1.5,
    });
    expect(result.success).toBe(false);
  });

  test("accepts zero order", () => {
    const result = createLessonSchema.safeParse({
      ...validData(),
      order: 0,
    });
    expect(result.success).toBe(true);
  });

  test("defaults isPreview to false", () => {
    const data = validData();
    delete (data as Record<string, unknown>).isPreview;
    const result = createLessonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPreview).toBe(false);
    }
  });
});

describe("updateLessonSchema", () => {
  test("requires id field", () => {
    const result = updateLessonSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(false);
  });

  test("accepts id alone", () => {
    const result = updateLessonSchema.safeParse({ id: "lesson-1" });
    expect(result.success).toBe(true);
  });

  test("validates slug when provided", () => {
    const result = updateLessonSchema.safeParse({
      id: "lesson-1",
      slug: "UPPER CASE",
    });
    expect(result.success).toBe(false);
  });

  test("validates videoUrl when provided", () => {
    const result = updateLessonSchema.safeParse({
      id: "lesson-1",
      videoUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
