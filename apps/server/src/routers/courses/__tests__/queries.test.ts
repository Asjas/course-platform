import {
  checkCoursePublishReadiness,
  getAllCourseProgressAsAdmin,
  getCourseProgress,
  getEnrollmentStatus,
  getLessonProgress,
} from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock dependencies
vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      course: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
      courseLesson: {
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue(null),
          }),
        }),
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      },
      lessonProgress: {
        findFirst: vi.fn(),
      },
      courseProgress: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
        findFirst: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("getCourseProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is a function that accepts userId and courseId", () => {
    expect(typeof getCourseProgress).toBe("function");
  });
});

describe("getLessonProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is a function that accepts userId and lessonId", () => {
    expect(typeof getLessonProgress).toBe("function");
  });
});

describe("getEnrollmentStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is a function that accepts userId and courseId", () => {
    expect(typeof getEnrollmentStatus).toBe("function");
  });
});

describe("getAllCourseProgressAsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllCourseProgressAsAdmin).toBe("function");
  });

  test("returns an array", async () => {
    const result = await getAllCourseProgressAsAdmin();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("checkCoursePublishReadiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof checkCoursePublishReadiness).toBe("function");
  });

  test("returns ready:true when course has no lessons", async () => {
    const result = await checkCoursePublishReadiness("course-1");
    expect(result).toEqual({ ready: true, issues: [] });
  });
});
