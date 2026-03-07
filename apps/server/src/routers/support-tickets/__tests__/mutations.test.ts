import {
  deleteSupportTicketById,
  deleteSupportTicketCommentById,
  insertSupportTicket,
  insertSupportTicketComment,
  updateSupportTicketById,
  updateSupportTicketCommentById,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { db } from "~/db/index.js";

vi.mock("~/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "ticket:test", title: "Test Ticket" }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "ticket:test", title: "Updated" }]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "ticket:test", title: "Deleted" }]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/support-tickets.js", () => ({
  supportTicket: { id: "id" },
  supportTicketComment: { id: "id" },
}));

const mockDb = vi.mocked(db);

describe("insertSupportTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([
            { id: "ticket:01", title: "New Ticket", userId: "user:1" },
          ]),
      }),
    } as never);
  });

  test("inserts a support ticket and returns it", async () => {
    const result = await insertSupportTicket({
      newSupportTicket: {
        title: "New Ticket",
        userId: "user:1",
      } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("New Ticket");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("updateSupportTicketById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "ticket:01", title: "Updated Ticket" }]),
        }),
      }),
    } as never);
  });

  test("updates a support ticket by ID", async () => {
    const result = await updateSupportTicketById({
      ticketId: "ticket:01",
      updates: { title: "Updated Ticket" } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Updated Ticket");
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("deleteSupportTicketById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "ticket:01", title: "Deleted Ticket" }]),
      }),
    } as never);
  });

  test("deletes a support ticket by ID", async () => {
    const result = await deleteSupportTicketById({ ticketId: "ticket:01" });

    expect(result).toBeDefined();
    expect(result.id).toBe("ticket:01");
    expect(mockDb.delete).toHaveBeenCalled();
  });
});

describe("insertSupportTicketComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "comment:01",
            comment: "Test comment",
            ticketId: "ticket:01",
          },
        ]),
      }),
    } as never);
  });

  test("inserts a support ticket comment", async () => {
    const result = await insertSupportTicketComment({
      newSupportTicketComment: {
        comment: "Test comment",
        ticketId: "ticket:01",
      } as never,
    });

    expect(result).toBeDefined();
    expect(result.comment).toBe("Test comment");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("updateSupportTicketCommentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([
              { id: "comment:01", comment: "Updated comment" },
            ]),
        }),
      }),
    } as never);
  });

  test("updates a support ticket comment by ID", async () => {
    const result = await updateSupportTicketCommentById({
      commentId: "comment:01",
      updates: { comment: "Updated comment" } as never,
    });

    expect(result).toBeDefined();
    expect(result.comment).toBe("Updated comment");
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("deleteSupportTicketCommentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([
            { id: "comment:01", comment: "Deleted comment" },
          ]),
      }),
    } as never);
  });

  test("deletes a support ticket comment by ID", async () => {
    const result = await deleteSupportTicketCommentById({
      commentId: "comment:01",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe("comment:01");
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
