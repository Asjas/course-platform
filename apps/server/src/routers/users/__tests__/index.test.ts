import { usersRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockFindFirst } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      user: {
        findFirst: mockFindFirst,
      },
    },
  },
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  return usersRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
  } as never);
}

describe("usersRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getUserProfile rejects unauthenticated callers", async () => {
    const caller = createCaller();

    await expect(
      caller.getUserProfile({ name: "alice" }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  });

  test("getUserProfile returns null when no profile matches", async () => {
    mockFindFirst.mockResolvedValue(null);
    const caller = createCaller({ id: "user-1", role: "student" });

    const result = await caller.getUserProfile({ name: "missing-user" });

    expect(result).toBeNull();
  });

  test("getUserProfile returns public profile fields", async () => {
    mockFindFirst.mockResolvedValue({
      id: "user-2",
      name: "Alice",
      username: "alice",
      displayUsername: "Alice",
      color: "#ff6600",
      image: null,
      role: "student",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
    });

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getUserProfile({ name: "alice" });

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: "user-2",
      name: "Alice",
      username: "alice",
      role: "student",
    });
  });
});
