import {
  getAdminUsers,
  getAllReviews,
  getReviewById,
  getUserReviewForCourse,
} from "../queries.js";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      courseReview: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue([]) }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue(null) }),
        }),
      },
      user: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue([]) }),
        }),
      },
    },
  },
}));

vi.mock("~/db/schema/index.js", () => ({
  courseReview: {
    id: "id",
    userId: "userId",
    courseId: "courseId",
  },
  supportTicket: {
    userId: "userId",
    status: "status",
  },
}));

describe("getAllReviews", () => {
  test("is an exported function", () => {
    expect(typeof getAllReviews).toBe("function");
  });
});

describe("getUserReviewForCourse", () => {
  test("is an exported function", () => {
    expect(typeof getUserReviewForCourse).toBe("function");
  });
});

describe("getReviewById", () => {
  test("is an exported function", () => {
    expect(typeof getReviewById).toBe("function");
  });
});

describe("getAdminUsers", () => {
  test("is an exported function", () => {
    expect(typeof getAdminUsers).toBe("function");
  });
});
