import { getAllEnrollmentsAsAdmin } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      enrollment: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
      },
    },
  },
}));

describe("getAllEnrollmentsAsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllEnrollmentsAsAdmin).toBe("function");
  });

  test("returns an array of enrollments with user and course", async () => {
    const mockEnrollments = [
      {
        id: "enroll:1",
        enrollmentType: "individual",
        enrollmentSource: "direct",
        status: "active",
        enrolledAt: new Date("2024-01-10"),
        user: {
          id: "user:1",
          name: "Alice",
          email: "alice@example.com",
          image: null,
          role: "student",
        },
        course: {
          id: "course:1",
          name: "Learn TypeScript",
          slug: "learn-typescript",
        },
      },
      {
        id: "enroll:2",
        enrollmentType: "gift",
        enrollmentSource: "gift",
        status: "completed",
        enrolledAt: new Date("2024-02-01"),
        user: {
          id: "user:2",
          name: "Bob",
          email: "bob@example.com",
          image: null,
          role: "student",
        },
        course: {
          id: "course:1",
          name: "Learn TypeScript",
          slug: "learn-typescript",
        },
      },
    ];
    mockExecute.mockResolvedValueOnce(mockEnrollments);
    const result = await getAllEnrollmentsAsAdmin();
    expect(result).toEqual(mockEnrollments);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no enrollments exist", async () => {
    mockExecute.mockResolvedValueOnce([]);
    const result = await getAllEnrollmentsAsAdmin();
    expect(result).toEqual([]);
  });

  test("each enrollment contains user and course relations", async () => {
    const mockEnrollments = [
      {
        id: "enroll:1",
        status: "active",
        user: { id: "user:1", name: "Carol", email: "carol@example.com" },
        course: {
          id: "course:2",
          name: "Fastify Fundamentals",
          slug: "fastify",
        },
      },
    ];
    mockExecute.mockResolvedValueOnce(mockEnrollments);
    const result = await getAllEnrollmentsAsAdmin();
    expect(result[0].user).toBeDefined();
    expect(result[0].course).toBeDefined();
    expect(result[0].user?.name).toBe("Carol");
    expect(result[0].course?.name).toBe("Fastify Fundamentals");
  });
});
