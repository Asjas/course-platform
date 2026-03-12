import { getAdminUserIds, getAdminUsers } from "../user.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      user: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
      },
    },
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("~/db/schema/user.js", () => ({
  user: {
    role: "role",
    id: "id",
    username: "username",
    name: "name",
    email: "email",
  },
}));

vi.mock("~/db/schema/enrollment.js", () => ({
  enrollment: {
    userId: "userId",
    courseId: "courseId",
  },
}));

describe("getAdminUserIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAdminUserIds).toBe("function");
  });

  test("returns array of admin user IDs", async () => {
    mockExecute.mockResolvedValueOnce([
      { id: "admin:1" },
      { id: "admin:2" },
      { id: "admin:3" },
    ]);
    const result = await getAdminUserIds();
    expect(result).toEqual(["admin:1", "admin:2", "admin:3"]);
  });

  test("returns empty array when no admins exist", async () => {
    mockExecute.mockResolvedValueOnce([]);
    const result = await getAdminUserIds();
    expect(result).toEqual([]);
  });

  test("maps id property from each admin", async () => {
    mockExecute.mockResolvedValueOnce([{ id: "single-admin" }]);
    const result = await getAdminUserIds();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("single-admin");
  });
});

describe("getAdminUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAdminUsers).toBe("function");
  });

  test("returns full admin user objects", async () => {
    const mockAdmins = [
      {
        id: "admin:1",
        name: "Admin One",
        email: "admin1@test.com",
        role: "admin",
      },
      {
        id: "admin:2",
        name: "Admin Two",
        email: "admin2@test.com",
        role: "admin",
      },
    ];
    mockExecute.mockResolvedValueOnce(mockAdmins);
    const result = await getAdminUsers();
    expect(result).toEqual(mockAdmins);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no admins exist", async () => {
    mockExecute.mockResolvedValueOnce([]);
    const result = await getAdminUsers();
    expect(result).toEqual([]);
  });
});
