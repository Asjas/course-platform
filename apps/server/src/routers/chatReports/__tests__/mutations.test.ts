import {
  deleteReportedMessageFromRedis,
  insertChatReport,
  updateReportStatus,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockInsert, mockUpdate, mockXrange, mockXdel } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockXrange: vi.fn(),
  mockXdel: vi.fn(),
}));

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

vi.mock("~/db/schema/chatMessageReports.js", () => ({
  chatMessageReport: {
    id: "id",
    status: "status",
    reviewedBy: "reviewedBy",
    reviewedAt: "reviewedAt",
  },
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    }),
  },
}));

vi.mock("~/lib/redis.js", () => ({
  redis: {
    xrange: mockXrange,
    xdel: mockXdel,
  },
}));

describe("insertChatReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("inserts a new chat report and returns it", async () => {
    const report = {
      id: "report:1",
      messageId: "msg:1",
      channelId: "general",
      reportedBy: "user:1",
      reason: "spam" as const,
      details: null,
      messageContent: "bad message",
      messageAuthor: "spammer",
      status: "pending" as const,
      reviewedBy: null,
      reviewedAt: null,
    };
    mockInsert.mockResolvedValueOnce([report]);
    const result = await insertChatReport(report);
    expect(result).toEqual(report);
  });
});

describe("updateReportStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates a report status and returns the updated report", async () => {
    const updated = {
      id: "report:1",
      status: "reviewed",
      reviewedBy: "admin:1",
      reviewedAt: new Date(),
    };
    mockUpdate.mockResolvedValueOnce([updated]);
    const result = await updateReportStatus({
      reportId: "report:1",
      status: "reviewed",
      reviewedBy: "admin:1",
    });
    expect(result).toEqual(updated);
  });

  test("accepts dismissed status", async () => {
    const updated = { id: "report:1", status: "dismissed" };
    mockUpdate.mockResolvedValueOnce([updated]);
    const result = await updateReportStatus({
      reportId: "report:1",
      status: "dismissed",
      reviewedBy: "admin:1",
    });
    expect(result.status).toBe("dismissed");
  });

  test("accepts actioned status", async () => {
    const updated = { id: "report:1", status: "actioned" };
    mockUpdate.mockResolvedValueOnce([updated]);
    const result = await updateReportStatus({
      reportId: "report:1",
      status: "actioned",
      reviewedBy: "admin:2",
    });
    expect(result.status).toBe("actioned");
  });
});

describe("deleteReportedMessageFromRedis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes a message from a regular channel stream", async () => {
    mockXrange.mockResolvedValueOnce([
      ["stream-id-1", ["field", JSON.stringify({ id: "msg:1" })]],
    ]);
    mockXdel.mockResolvedValueOnce(1);

    const result = await deleteReportedMessageFromRedis({
      messageId: "msg:1",
      channelId: "general",
    });
    expect(result).toBe(true);
    expect(mockXrange).toHaveBeenCalledWith(
      "chat:channel:general:messages",
      "-",
      "+",
    );
    expect(mockXdel).toHaveBeenCalledWith(
      "chat:channel:general:messages",
      "stream-id-1",
    );
  });

  test("deletes a message from a DM stream", async () => {
    mockXrange.mockResolvedValueOnce([
      ["stream-id-2", ["field", JSON.stringify({ id: "msg:2" })]],
    ]);
    mockXdel.mockResolvedValueOnce(1);

    const result = await deleteReportedMessageFromRedis({
      messageId: "msg:2",
      channelId: "dm:conversation123",
    });
    expect(result).toBe(true);
    expect(mockXrange).toHaveBeenCalledWith(
      "chat:dm:conversation123:messages",
      "-",
      "+",
    );
  });

  test("returns false when message is not found", async () => {
    mockXrange.mockResolvedValueOnce([
      ["stream-id-1", ["field", JSON.stringify({ id: "msg:other" })]],
    ]);

    const result = await deleteReportedMessageFromRedis({
      messageId: "msg:nonexistent",
      channelId: "general",
    });
    expect(result).toBe(false);
    expect(mockXdel).not.toHaveBeenCalled();
  });

  test("returns false when stream is empty", async () => {
    mockXrange.mockResolvedValueOnce([]);

    const result = await deleteReportedMessageFromRedis({
      messageId: "msg:1",
      channelId: "general",
    });
    expect(result).toBe(false);
  });

  test("skips corrupted JSON entries", async () => {
    mockXrange.mockResolvedValueOnce([
      ["stream-id-1", ["field", "not-valid-json"]],
      ["stream-id-2", ["field", JSON.stringify({ id: "msg:1" })]],
    ]);
    mockXdel.mockResolvedValueOnce(1);

    const result = await deleteReportedMessageFromRedis({
      messageId: "msg:1",
      channelId: "general",
    });
    expect(result).toBe(true);
    expect(mockXdel).toHaveBeenCalledWith(
      "chat:channel:general:messages",
      "stream-id-2",
    );
  });
});
