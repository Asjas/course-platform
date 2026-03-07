import { getAllChatReports, getChatReportById } from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      chatMessageReport: {
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
  },
}));

vi.mock("~/db/schema/chatMessageReports.js", () => ({
  chatMessageReport: {
    id: "id",
    createdAt: "createdAt",
  },
}));

describe("getAllChatReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getAllChatReports).toBe("function");
  });

  test("returns an array of reports", async () => {
    const mockReports = [
      {
        id: "report:1",
        messageId: "msg:1",
        channelId: "general",
        reason: "spam",
        status: "pending",
        reporter: { id: "user:1", name: "Alice", email: "alice@test.com" },
        reviewer: null,
      },
      {
        id: "report:2",
        messageId: "msg:2",
        channelId: "random",
        reason: "harassment",
        status: "reviewed",
        reporter: { id: "user:2", name: "Bob", email: "bob@test.com" },
        reviewer: { id: "admin:1", name: "Admin", email: "admin@test.com" },
      },
    ];
    mockExecute.mockResolvedValueOnce(mockReports);
    const result = await getAllChatReports();
    expect(result).toEqual(mockReports);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when no reports exist", async () => {
    mockExecute.mockResolvedValueOnce([]);
    const result = await getAllChatReports();
    expect(result).toEqual([]);
  });
});

describe("getChatReportById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof getChatReportById).toBe("function");
  });

  test("returns a report when found", async () => {
    const mockReport = {
      id: "report:1",
      messageId: "msg:1",
      channelId: "general",
      reason: "spam",
      status: "pending",
      reporter: { id: "user:1", name: "Alice", email: "alice@test.com" },
      reviewer: null,
    };
    mockExecute.mockResolvedValueOnce(mockReport);
    const result = await getChatReportById("report:1");
    expect(result).toEqual(mockReport);
  });

  test("returns null when report not found", async () => {
    mockExecute.mockResolvedValueOnce(null);
    const result = await getChatReportById("nonexistent");
    expect(result).toBeNull();
  });

  test("passes reportId to execute", async () => {
    mockExecute.mockResolvedValueOnce(null);
    await getChatReportById("report:abc");
    expect(mockExecute).toHaveBeenCalledWith({ reportId: "report:abc" });
  });
});
