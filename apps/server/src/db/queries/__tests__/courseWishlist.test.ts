import {
  getCourseWishlistByEmailAndCourse,
  getCourseWishlistById,
  getCourseWishlistByUser,
  getCourseWishlistCount,
} from "../courseWishlist.js";
import { fromPartial } from "@total-typescript/shoehorn";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      courseWishlist: {
        findFirst: vi.fn().mockResolvedValue(undefined),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/index.js", () => ({
  courseWishlist: {
    id: "id",
    email: "email",
    courseId: "courseId",
    userId: "userId",
  },
}));

describe("getCourseWishlistByEmailAndCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getCourseWishlistByEmailAndCourse).toBe("function");
  });

  test("returns an entry when found", async () => {
    const { db } = await import("~/db/index.js");
    const mockEntry = {
      id: "cwl:123",
      email: "test@example.com",
      courseId: "course:1",
    };
    vi.mocked(db.query.courseWishlist.findFirst).mockResolvedValueOnce(
      fromPartial(mockEntry),
    );

    const result = await getCourseWishlistByEmailAndCourse(
      "test@example.com",
      "course:1",
    );
    expect(result).toEqual(mockEntry);
  });

  test("returns undefined when not found", async () => {
    const result = await getCourseWishlistByEmailAndCourse(
      "none@example.com",
      "course:1",
    );
    expect(result).toBeUndefined();
  });
});

describe("getCourseWishlistById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getCourseWishlistById).toBe("function");
  });

  test("returns an entry when found", async () => {
    const { db } = await import("~/db/index.js");
    const mockEntry = { id: "cwl:123", email: "test@example.com" };
    vi.mocked(db.query.courseWishlist.findFirst).mockResolvedValueOnce(
      fromPartial(mockEntry),
    );

    const result = await getCourseWishlistById("cwl:123");
    expect(result).toEqual(mockEntry);
  });

  test("returns undefined when not found", async () => {
    const result = await getCourseWishlistById("cwl:nonexistent");
    expect(result).toBeUndefined();
  });
});

describe("getCourseWishlistCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getCourseWishlistCount).toBe("function");
  });

  test("returns the count of wishlist entries", async () => {
    const { db } = await import("~/db/index.js");
    vi.mocked(db.select).mockReturnValueOnce(
      fromPartial({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      }),
    );

    const result = await getCourseWishlistCount("course:1");
    expect(result).toBe(5);
  });

  test("returns 0 when no entries exist", async () => {
    const result = await getCourseWishlistCount("course:empty");
    expect(result).toBe(0);
  });
});

describe("getCourseWishlistByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getCourseWishlistByUser).toBe("function");
  });

  test("returns entries for a user", async () => {
    const { db } = await import("~/db/index.js");
    const mockEntries = [
      { id: "cwl:1", userId: "user:1", courseId: "course:1" },
      { id: "cwl:2", userId: "user:1", courseId: "course:2" },
    ];
    vi.mocked(db.query.courseWishlist.findMany).mockResolvedValueOnce(
      fromPartial(mockEntries),
    );

    const result = await getCourseWishlistByUser("user:1");
    expect(result).toEqual(mockEntries);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when user has no entries", async () => {
    const result = await getCourseWishlistByUser("user:none");
    expect(result).toEqual([]);
  });
});
