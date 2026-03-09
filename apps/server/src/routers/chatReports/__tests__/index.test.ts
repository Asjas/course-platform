import { chatReportsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockInsertChatReport,
  mockUpdateReportStatus,
  mockDeleteReportedMessageFromRedis,
  mockGetAllChatReports,
  mockGetChatReportById,
  mockNotifyAdminChatMessageReported,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
} = vi.hoisted(() => ({
  mockInsertChatReport: vi.fn(),
  mockUpdateReportStatus: vi.fn(),
  mockDeleteReportedMessageFromRedis: vi.fn(),
  mockGetAllChatReports: vi.fn(),
  mockGetChatReportById: vi.fn(),
  mockNotifyAdminChatMessageReported: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
}));

vi.mock("../mutations.js", () => ({
  insertChatReport: mockInsertChatReport,
  updateReportStatus: mockUpdateReportStatus,
  deleteReportedMessageFromRedis: mockDeleteReportedMessageFromRedis,
}));

vi.mock("../queries.js", () => ({
  getAllChatReports: mockGetAllChatReports,
  getChatReportById: mockGetChatReportById,
}));

vi.mock("~/lib/notifications.js", () => ({
  notifyAdminChatMessageReported: mockNotifyAdminChatMessageReported,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  chatReportsSyncConfig: { streamKeyPrefix: "sync:chatReports" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: vi.fn(),
}));

interface TestUser {
  id: string;
  role: string;
  name: string;
}

function createCaller(user?: TestUser) {
  return chatReportsRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
  } as never);
}

describe("chatReportsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
  });

  test("getAll denies non-admin users", async () => {
    const caller = createCaller({
      id: "user-1",
      role: "student",
      name: "User",
    });

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getReportById throws NOT_FOUND when report does not exist", async () => {
    const caller = createCaller({
      id: "admin-1",
      role: "admin",
      name: "Admin",
    });
    mockGetChatReportById.mockResolvedValue(null);

    await expect(caller.getReportById("report-missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Report not found",
    });
  });

  test("reportMessage creates report and notifies admins", async () => {
    const caller = createCaller({
      id: "user-1",
      role: "student",
      name: "Alice",
    });
    mockInsertChatReport.mockResolvedValue({ id: "report-1" });

    const result = await caller.reportMessage({
      messageId: "msg-1",
      channelId: "channel-1",
      reason: "spam",
      messageContent: "spam content",
      messageAuthor: "spammer",
    });

    expect(mockInsertChatReport).toHaveBeenCalledTimes(1);
    expect(mockNotifyAdminChatMessageReported).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: "report-1" });
  });

  test("deleteReportedMessage returns NOT_FOUND when redis delete fails", async () => {
    const caller = createCaller({
      id: "admin-1",
      role: "admin",
      name: "Admin",
    });
    mockDeleteReportedMessageFromRedis.mockResolvedValue(false);

    await expect(
      caller.deleteReportedMessage({
        reportId: "report-1",
        messageId: "msg-1",
        channelId: "channel-1",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Message not found in channel",
    });
  });

  test("getUpdatesSince wraps internal failures", async () => {
    const caller = createCaller({
      id: "admin-1",
      role: "admin",
      name: "Admin",
    });
    mockGetEntityUpdatesSince.mockRejectedValue(new Error("redis down"));

    await expect(
      caller.getUpdatesSince({ since: Date.now() - 5000 }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch chat report updates",
    });
  });
});
