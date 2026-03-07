import {
  confirmCourseWishlistEntry,
  createCourseWishlistEntry,
  unsubscribeCourseWishlistEntry,
} from "../courseWishlist.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("~/db/index.js", () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: mockInsert,
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: mockUpdate,
        }),
      }),
    }),
  },
}));

vi.mock("~/db/schema/index.js", () => ({
  courseWishlist: {
    id: "id",
    email: "email",
    courseId: "courseId",
  },
}));

vi.mock("ulid", () => ({
  ulid: () => "01MOCK_ULID",
}));

describe("createCourseWishlistEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates a new wishlist entry", async () => {
    const entry = {
      id: "cwl:01MOCK_ULID",
      email: "test@example.com",
      courseId: "course:1",
    };
    mockInsert.mockResolvedValueOnce([entry]);

    const result = await createCourseWishlistEntry({
      email: "test@example.com",
      courseId: "course:1",
    });
    expect(result).toEqual(entry);
  });

  test("creates entry with optional fields", async () => {
    const entry = {
      id: "cwl:01MOCK_ULID",
      email: "test@example.com",
      courseId: "course:1",
      name: "Test User",
      referrer: "google",
      utmSource: "twitter",
    };
    mockInsert.mockResolvedValueOnce([entry]);

    const result = await createCourseWishlistEntry({
      email: "test@example.com",
      courseId: "course:1",
      name: "Test User",
      referrer: "google",
      utmSource: "twitter",
    });
    expect(result.name).toBe("Test User");
    expect(result.referrer).toBe("google");
  });

  test("lowercases the email", async () => {
    const entry = { id: "cwl:01MOCK_ULID", email: "test@example.com" };
    mockInsert.mockResolvedValueOnce([entry]);

    const result = await createCourseWishlistEntry({
      email: "TEST@EXAMPLE.COM",
      courseId: "course:1",
    });
    expect(result.email).toBe("test@example.com");
  });
});

describe("confirmCourseWishlistEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("confirms a wishlist entry", async () => {
    const confirmed = {
      id: "cwl:123",
      confirmedAt: new Date(),
    };
    mockUpdate.mockResolvedValueOnce([confirmed]);

    const result = await confirmCourseWishlistEntry("cwl:123");
    expect(result).toEqual(confirmed);
    expect(result.confirmedAt).toBeDefined();
  });
});

describe("unsubscribeCourseWishlistEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("unsubscribes a wishlist entry", async () => {
    const unsubscribed = {
      id: "cwl:123",
      unsubscribedAt: new Date(),
    };
    mockUpdate.mockResolvedValueOnce([unsubscribed]);

    const result = await unsubscribeCourseWishlistEntry("cwl:123");
    expect(result).toEqual(unsubscribed);
    expect(result.unsubscribedAt).toBeDefined();
  });
});
