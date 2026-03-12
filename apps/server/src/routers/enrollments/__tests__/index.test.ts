import { enrollmentsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockGetAllEnrollmentsAsAdmin } = vi.hoisted(() => ({
  mockGetAllEnrollmentsAsAdmin: vi.fn(),
}));

vi.mock("../queries.js", () => ({
  getAllEnrollmentsAsAdmin: mockGetAllEnrollmentsAsAdmin,
}));

function createCaller(user?: { id: string; role: string; name: string }) {
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

  return enrollmentsRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    reply: { server },
  } as never);
}

describe("enrollmentsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    test("denies non-admin users", async () => {
      const caller = createCaller({
        id: "user-1",
        role: "student",
        name: "Student",
      });

      await expect(caller.getAll()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    test("denies unauthenticated requests", async () => {
      const caller = createCaller(undefined);

      await expect(caller.getAll()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    test("returns all enrollments for admin users", async () => {
      const caller = createCaller({
        id: "admin-1",
        role: "admin",
        name: "Admin",
      });
      const mockEnrollments = [
        {
          id: "enroll:1",
          status: "active",
          user: { id: "user:1", name: "Alice", email: "alice@example.com" },
          course: { id: "course:1", name: "TypeScript", slug: "typescript" },
        },
      ];
      mockGetAllEnrollmentsAsAdmin.mockResolvedValueOnce(mockEnrollments);

      const result = await caller.getAll();

      expect(result).toEqual(mockEnrollments);
      expect(mockGetAllEnrollmentsAsAdmin).toHaveBeenCalledTimes(1);
    });

    test("returns empty array when no enrollments exist", async () => {
      const caller = createCaller({
        id: "admin-1",
        role: "admin",
        name: "Admin",
      });
      mockGetAllEnrollmentsAsAdmin.mockResolvedValueOnce([]);

      const result = await caller.getAll();

      expect(result).toEqual([]);
    });

    test("throws INTERNAL_SERVER_ERROR when query fails", async () => {
      const caller = createCaller({
        id: "admin-1",
        role: "admin",
        name: "Admin",
      });
      mockGetAllEnrollmentsAsAdmin.mockRejectedValueOnce(new Error("DB error"));

      await expect(caller.getAll()).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    });
  });
});
