import { getAllEarlySignups, getEarlySignupById } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockExecuteLegacyMany,
  mockExecuteLegacyById,
  mockExecuteWishlistMany,
  mockExecuteWishlistById,
} = vi.hoisted(() => ({
  mockExecuteLegacyMany: vi.fn(),
  mockExecuteLegacyById: vi.fn(),
  mockExecuteWishlistMany: vi.fn(),
  mockExecuteWishlistById: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      earlySignup: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecuteLegacyMany,
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecuteLegacyById,
          }),
        }),
      },
      courseWishlist: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecuteWishlistMany,
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecuteWishlistById,
          }),
        }),
      },
    },
  },
}));

describe("getAllEarlySignups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllEarlySignups).toBe("function");
  });

  test("returns an array of signups", async () => {
    const mockLegacySignups = [
      {
        id: "signup:1",
        email: "alice@example.com",
        name: "Alice",
        source: "learnfastify",
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        confirmedAt: null,
        unsubscribedAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ];

    const mockWishlistSignups = [
      {
        id: "cwl:1",
        userId: null,
        email: "bob@example.com",
        name: null,
        courseId: "course:1",
        referrer: "twitter",
        utmSource: "learnfastify",
        utmMedium: "social",
        utmCampaign: "launch",
        confirmedAt: new Date("2024-01-05"),
        unsubscribedAt: null,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-05"),
      },
    ];

    mockExecuteLegacyMany.mockResolvedValueOnce(mockLegacySignups);
    mockExecuteWishlistMany.mockResolvedValueOnce(mockWishlistSignups);

    const result = await getAllEarlySignups();

    expect(result).toEqual([
      {
        id: "cwl:1",
        email: "bob@example.com",
        name: null,
        referrer: "twitter",
        confirmedAt: new Date("2024-01-05"),
        unsubscribedAt: null,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-05"),
        source: "learnfastify",
        sourceTable: "course_wishlist",
      },
      {
        id: "signup:1",
        email: "alice@example.com",
        name: "Alice",
        source: "learnfastify",
        referrer: null,
        confirmedAt: null,
        unsubscribedAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        sourceTable: "early_signup",
      },
    ]);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no signups exist", async () => {
    mockExecuteLegacyMany.mockResolvedValueOnce([]);
    mockExecuteWishlistMany.mockResolvedValueOnce([]);
    const result = await getAllEarlySignups();
    expect(result).toEqual([]);
  });
});

describe("getEarlySignupById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getEarlySignupById).toBe("function");
  });

  test("returns a signup when found", async () => {
    const mockLegacySignup = {
      id: "signup:1",
      email: "alice@example.com",
      name: "Alice",
      source: "learnfastify",
      referrer: null,
      unsubscribedAt: null,
      confirmedAt: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    mockExecuteLegacyById.mockResolvedValueOnce(mockLegacySignup);
    mockExecuteWishlistById.mockResolvedValueOnce(null);

    const result = await getEarlySignupById({ id: "signup:1" });

    expect(result).toEqual({
      ...mockLegacySignup,
      sourceTable: "early_signup",
    });
  });

  test("returns wishlist signup when found in course wishlist", async () => {
    const mockWishlistSignup = {
      id: "cwl:1",
      userId: null,
      email: "bob@example.com",
      name: "Bob",
      courseId: "course:1",
      referrer: "x",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    };

    mockExecuteLegacyById.mockResolvedValueOnce(null);
    mockExecuteWishlistById.mockResolvedValueOnce(mockWishlistSignup);

    const result = await getEarlySignupById({ id: "cwl:1" });

    expect(result).toEqual({
      id: "cwl:1",
      email: "bob@example.com",
      name: "Bob",
      source: "course-wishlist",
      referrer: "x",
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
      sourceTable: "course_wishlist",
    });
  });

  test("returns null when signup not found", async () => {
    mockExecuteLegacyById.mockResolvedValueOnce(null);
    mockExecuteWishlistById.mockResolvedValueOnce(null);
    const result = await getEarlySignupById({ id: "nonexistent" });
    expect(result).toBeNull();
  });

  test("passes id to execute", async () => {
    mockExecuteLegacyById.mockResolvedValueOnce(null);
    mockExecuteWishlistById.mockResolvedValueOnce(null);
    await getEarlySignupById({ id: "signup:abc" });
    expect(mockExecuteLegacyById).toHaveBeenCalledWith({
      legacyId: "signup:abc",
    });
    expect(mockExecuteWishlistById).toHaveBeenCalledWith({
      wishlistId: "signup:abc",
    });
  });
});
