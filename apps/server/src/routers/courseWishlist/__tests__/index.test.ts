import { courseWishlistRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockFindFirst,
  mockGetCourseWishlistByEmailAndCourse,
  mockCreateCourseWishlistEntry,
  mockGetCourseWishlistCount,
  mockGetCourseWishlistById,
  mockUnsubscribeCourseWishlistEntry,
  mockCreateCourseWishlistVerificationToken,
  mockSendMail,
  mockConfigOrigin,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockGetCourseWishlistByEmailAndCourse: vi.fn(),
  mockCreateCourseWishlistEntry: vi.fn(),
  mockGetCourseWishlistCount: vi.fn(),
  mockGetCourseWishlistById: vi.fn(),
  mockUnsubscribeCourseWishlistEntry: vi.fn(),
  mockCreateCourseWishlistVerificationToken: vi.fn(),
  mockSendMail: vi.fn(),
  mockConfigOrigin: ["https://codewizard.training"],
}));

vi.mock("~/config.js", () => ({
  default: {
    ORIGIN: mockConfigOrigin,
  },
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      course: {
        findFirst: mockFindFirst,
      },
    },
  },
}));

vi.mock("~/db/queries/courseWishlist.js", () => ({
  getCourseWishlistByEmailAndCourse: mockGetCourseWishlistByEmailAndCourse,
  getCourseWishlistById: mockGetCourseWishlistById,
  getCourseWishlistCount: mockGetCourseWishlistCount,
}));

vi.mock("~/db/mutations/courseWishlist.js", () => ({
  createCourseWishlistVerificationToken:
    mockCreateCourseWishlistVerificationToken,
  createCourseWishlistEntry: mockCreateCourseWishlistEntry,
  unsubscribeCourseWishlistEntry: mockUnsubscribeCourseWishlistEntry,
}));

vi.mock("~/lib/mailer.js", () => ({
  default: {
    sendMail: mockSendMail,
  },
}));

describe("courseWishlistRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("signup returns NOT_FOUND when course slug does not exist", async () => {
    const caller = courseWishlistRouter.createCaller({} as never);
    mockFindFirst.mockResolvedValue(null);

    await expect(
      caller.signup({
        email: "user@example.com",
        courseSlug: "missing-course",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Course not found",
    });
  });

  test("signup returns alreadySignedUp when entry already exists", async () => {
    const caller = courseWishlistRouter.createCaller({} as never);
    mockFindFirst.mockResolvedValue({ id: "course-1", name: "Course One" });
    mockGetCourseWishlistByEmailAndCourse.mockResolvedValue({
      id: "wishlist-1",
    });

    const result = await caller.signup({
      email: "user@example.com",
      courseSlug: "course-one",
    });

    expect(result).toMatchObject({
      success: true,
      alreadySignedUp: true,
    });
  });

  test("getCount returns 0 when course is unknown", async () => {
    const caller = courseWishlistRouter.createCaller({} as never);
    mockFindFirst.mockResolvedValue(null);

    const result = await caller.getCount({ courseSlug: "missing-course" });

    expect(result).toEqual({ count: 0 });
  });

  test("getCount returns wishlist count for known course", async () => {
    const caller = courseWishlistRouter.createCaller({} as never);
    mockFindFirst.mockResolvedValue({ id: "course-1" });
    mockGetCourseWishlistCount.mockResolvedValue(42);

    const result = await caller.getCount({ courseSlug: "course-one" });

    expect(mockGetCourseWishlistCount).toHaveBeenCalledWith("course-1");
    expect(result).toEqual({ count: 42 });
  });

  test("unsubscribe throws NOT_FOUND when entry is missing", async () => {
    const caller = courseWishlistRouter.createCaller({} as never);
    mockGetCourseWishlistById.mockResolvedValue(null);

    await expect(
      caller.unsubscribe({ id: "missing-id" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Entry not found",
    });
  });

  test("signup email verification link uses request API origin", async () => {
    const caller = courseWishlistRouter.createCaller({
      request: {
        headers: {
          "host": "api.codewizard.training",
          "x-forwarded-proto": "https",
        },
        protocol: "https",
      },
    } as never);

    mockFindFirst.mockResolvedValue({ id: "course-1", name: "Course One" });
    mockGetCourseWishlistByEmailAndCourse.mockResolvedValue(null);
    mockCreateCourseWishlistEntry.mockResolvedValue({ id: "wishlist-1" });
    mockCreateCourseWishlistVerificationToken.mockResolvedValue({
      id: "token-1",
      token: "raw-token",
    });
    mockSendMail.mockResolvedValue(undefined);

    await caller.signup({
      email: "user@example.com",
      courseSlug: "course-one",
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const [{ html }] = mockSendMail.mock.calls[0] as [{ html: string }];

    expect(html).toContain(
      "https://api.codewizard.training/verify-course-wishlist?token=raw-token",
    );
  });
});
