import { reviewsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockCreateReview,
  mockGetAllReviews,
  mockGetReviewById,
  mockGetReviewWithCourse,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
  mockNotifyAdminNewReview,
} = vi.hoisted(() => ({
  mockCreateReview: vi.fn(),
  mockGetAllReviews: vi.fn(),
  mockGetReviewById: vi.fn(),
  mockGetReviewWithCourse: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
  mockNotifyAdminNewReview: vi.fn(),
}));

vi.mock("~/routers/reviews/mutations.js", () => ({
  createReview: mockCreateReview,
  createAdminReview: vi.fn(),
  updateReview: vi.fn(),
  approveReview: vi.fn(),
  deleteReview: vi.fn(),
  getReviewWithCourse: mockGetReviewWithCourse,
}));

vi.mock("~/routers/reviews/queries.js", () => ({
  getAllReviews: mockGetAllReviews,
  getReviewById: mockGetReviewById,
  getUserReviewForCourse: vi.fn(),
  getAdminUsers: vi.fn(),
}));

vi.mock("~/lib/notifications.js", () => ({
  notifyAdminNewReview: mockNotifyAdminNewReview,
}));

vi.mock("~/routers/notifications/mutations.js", () => ({
  insertUserNotification: vi.fn(),
}));

vi.mock("~/lib/sse-sync.js", () => ({
  reviewsSyncConfig: { streamKeyPrefix: "sync:reviews" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: vi.fn(),
}));

interface TestUser {
  id: string;
  role: string;
  name: string;
}

function createCaller(user?: TestUser) {
  const log = {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  };

  const server = {
    log,
    to: async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
      try {
        const value = await promise;
        return [null, value];
      } catch (error) {
        return [error as Error, null];
      }
    },
  };

  const caller = reviewsRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    reply: { server },
  } as never);

  return { caller, log };
}

describe("reviewsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
  });

  test("getAll denies non-admin users", async () => {
    const { caller } = createCaller({
      id: "user-1",
      role: "student",
      name: "User",
    });

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("createReview maps unique constraint errors to CONFLICT", async () => {
    const { caller } = createCaller({
      id: "user-1",
      role: "student",
      name: "User",
    });
    const duplicateError = Object.assign(new Error("unique violation"), {
      code: "23505",
    });
    mockCreateReview.mockRejectedValue(duplicateError);

    await expect(
      caller.createReview({
        courseId: "course-1",
        rating: 5,
        title: "Great",
        comment: "Loved it",
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "You have already reviewed this course",
    });
  });

  test("getReviewById throws NOT_FOUND when review does not exist", async () => {
    const { caller } = createCaller({
      id: "admin-1",
      role: "admin",
      name: "Admin",
    });
    mockGetReviewById.mockResolvedValue(null);

    await expect(
      caller.getReviewById({ reviewId: "review-404" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Review not found",
    });
  });

  test("createReview publishes SSE update when review is created", async () => {
    const { caller } = createCaller({
      id: "user-1",
      role: "student",
      name: "Alice",
    });
    mockCreateReview.mockResolvedValue({ id: "review-1" });
    mockGetReviewWithCourse.mockResolvedValue({
      course: { name: "Course One" },
    });

    const result = await caller.createReview({
      courseId: "course-1",
      rating: 4,
      title: "Solid",
      comment: "Good content",
    });

    expect(result).toEqual({ id: "review-1" });
    expect(mockPublishEntityChange).toHaveBeenCalledTimes(1);
  });

  test("getUpdatesSince wraps failures", async () => {
    const { caller } = createCaller({
      id: "user-1",
      role: "student",
      name: "Alice",
    });
    mockGetEntityUpdatesSince.mockRejectedValue(new Error("redis down"));

    await expect(
      caller.getUpdatesSince({ since: Date.now() - 1_000 }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch review updates",
    });
  });
});
