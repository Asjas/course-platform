import { createReviewSchema } from "../create-review";
import { editReviewSchema } from "../edit-review";
import { describe, expect, test } from "vitest";

describe("createReviewSchema", () => {
  function validData() {
    return {
      userId: "user-1",
      courseId: "course-1",
      rating: 5,
      title: "Great course!",
      comment: "I learned a lot from this course.",
      externalLink: "",
      approved: false,
    };
  }

  test("accepts valid review data", () => {
    const result = createReviewSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects rating below 1", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects rating above 5", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-integer rating", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      rating: 4.5,
    });
    expect(result.success).toBe(false);
  });

  test("accepts null rating", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      rating: null,
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty title", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      title: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects title longer than 100 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty comment", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      comment: "",
    });
    expect(result.success).toBe(false);
  });

  test("rejects comment longer than 2000 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validData(),
      comment: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing userId", () => {
    const data = validData();
    delete (data as Record<string, unknown>).userId;
    const result = createReviewSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("editReviewSchema", () => {
  test("accepts valid edit data", () => {
    const result = editReviewSchema.safeParse({
      title: "Updated title",
      comment: "Updated comment",
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty title", () => {
    const result = editReviewSchema.safeParse({
      title: "",
      comment: "Comment",
    });
    expect(result.success).toBe(false);
  });

  test("rejects title over 100 characters", () => {
    const result = editReviewSchema.safeParse({
      title: "a".repeat(101),
      comment: "Comment",
    });
    expect(result.success).toBe(false);
  });

  test("rejects comment over 2000 characters", () => {
    const result = editReviewSchema.safeParse({
      title: "Title",
      comment: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
