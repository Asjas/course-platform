import {
  getAllSupportTickets,
  getSupportTicketById,
  getSupportTicketCommentById,
  getSupportTicketCountsByCourse,
} from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { db } from "~/db/index.js";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      supportTicket: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
      supportTicketComment: {
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        groupBy: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/support-tickets.js", () => ({
  supportTicket: {
    id: "id",
    courseId: "courseId",
  },
}));

describe("getAllSupportTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllSupportTickets).toBe("function");
  });

  test("returns an array", async () => {
    const result = await getAllSupportTickets();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getSupportTicketById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getSupportTicketById).toBe("function");
  });

  test("accepts a ticketId parameter", async () => {
    const result = await getSupportTicketById({ ticketId: "ticket:123" });
    expect(result).toBeNull();
  });
});

describe("getSupportTicketCommentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getSupportTicketCommentById).toBe("function");
  });

  test("accepts a commentId parameter", async () => {
    const result = await getSupportTicketCommentById({
      commentId: "comment:123",
    });
    expect(result).toBeNull();
  });
});

describe("getSupportTicketCountsByCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getSupportTicketCountsByCourse).toBe("function");
  });

  test("returns a Map", async () => {
    const result = await getSupportTicketCountsByCourse();
    expect(result).toBeInstanceOf(Map);
  });

  test("filters out entries with null courseId", async () => {
    const mockDb = vi.mocked(db);
    vi.mocked(mockDb.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        groupBy: vi.fn().mockResolvedValue([
          { courseId: "course:1", count: 5 },
          { courseId: null, count: 2 },
          { courseId: "course:2", count: 3 },
        ]),
      }),
    } as never);

    const result = await getSupportTicketCountsByCourse();
    expect(result).toBeInstanceOf(Map);
    expect(result.get("course:1")).toBe(5);
    expect(result.get("course:2")).toBe(3);
    expect(result.has(null as unknown as string)).toBe(false);
  });
});
