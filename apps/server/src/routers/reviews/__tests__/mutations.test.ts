import {
  approveReview,
  createAdminReview,
  createReview,
  deleteReview,
  getReviewWithCourse,
  updateReview,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockFindFirst, mockInsert, mockUpdate, mockDelete } = vi.hoisted(
  () => ({
    mockFindFirst: vi.fn(),
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }),
);

vi.mock("~/db/index.js", () => ({
  db: {
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    query: {
      courseReview: {
        findFirst: mockFindFirst,
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
}));

describe("createReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "review-1",
            userId: "user-1",
            courseId: "course-1",
            rating: 5,
            title: "Great",
            comment: "Loved it",
            approved: false,
          },
        ]),
      }),
    });
  });

  test("creates a review with correct parameters", async () => {
    const review = await createReview({
      userId: "user-1",
      courseId: "course-1",
      rating: 5,
      title: "Great course",
      comment: "I loved this course!",
    });

    expect(review).toBeDefined();
    expect(review.id).toBe("review-1");
    expect(mockInsert).toHaveBeenCalled();
  });
});

describe("createAdminReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "review-2",
            userId: "user-1",
            courseId: "course-1",
            rating: null,
            title: "External review",
            comment: "From social media",
            externalLink: "https://example.com",
            approved: true,
            reviewedAt: new Date(),
          },
        ]),
      }),
    });
  });

  test("creates an admin review with external link and approval", async () => {
    const review = await createAdminReview({
      userId: "user-1",
      courseId: "course-1",
      rating: null,
      title: "External review",
      comment: "From social media",
      externalLink: "https://example.com",
      approved: true,
    });

    expect(review).toBeDefined();
    expect(review.id).toBe("review-2");
    expect(review.approved).toBe(true);
    expect(review.externalLink).toBe("https://example.com");
  });
});

describe("updateReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "review-1",
              title: "Updated title",
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });
  });

  test("updates a review with partial data", async () => {
    const review = await updateReview({
      reviewId: "review-1",
      updates: { title: "Updated title" },
    });

    expect(review).toBeDefined();
    expect(review.title).toBe("Updated title");
    expect(mockUpdate).toHaveBeenCalled();
  });
});

describe("deleteReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "review-1" }]),
      }),
    });
  });

  test("deletes a review by ID", async () => {
    const review = await deleteReview({ reviewId: "review-1" });

    expect(review).toBeDefined();
    expect(review.id).toBe("review-1");
    expect(mockDelete).toHaveBeenCalled();
  });
});

describe("approveReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "review-1",
              approved: true,
              reviewedAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });
  });

  test("approves a review and sets reviewedAt", async () => {
    const review = await approveReview({ reviewId: "review-1" });

    expect(review).toBeDefined();
    expect(review.approved).toBe(true);
    expect(review.reviewedAt).toBeDefined();
  });
});

describe("getReviewWithCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns review with course info", async () => {
    const mockReview = {
      id: "review-1",
      userId: "user-1",
      courseId: "course-1",
      course: { id: "course-1", name: "Course 1", slug: "course-1" },
    };

    mockFindFirst.mockResolvedValue(mockReview);

    const review = await getReviewWithCourse({ reviewId: "review-1" });

    expect(review).toBeDefined();
    expect(review?.course.name).toBe("Course 1");
  });

  test("returns undefined when review not found", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    const review = await getReviewWithCourse({ reviewId: "nonexistent" });
    expect(review).toBeUndefined();
  });
});
