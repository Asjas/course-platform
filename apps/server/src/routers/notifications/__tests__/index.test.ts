import { notificationsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockGetUnreadNotificationsForUser,
  mockGetReadNotificationsForUser,
  mockGetNotificationById,
  mockMarkNotificationAsRead,
  mockMarkAllNotificationsAsRead,
  mockDeleteNotification,
  mockGetEntityUpdatesSince,
} = vi.hoisted(() => ({
  mockGetUnreadNotificationsForUser: vi.fn(),
  mockGetReadNotificationsForUser: vi.fn(),
  mockGetNotificationById: vi.fn(),
  mockMarkNotificationAsRead: vi.fn(),
  mockMarkAllNotificationsAsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
}));

vi.mock("../queries.js", () => ({
  getUnreadNotificationsForUser: mockGetUnreadNotificationsForUser,
  getReadNotificationsForUser: mockGetReadNotificationsForUser,
  getNotificationById: mockGetNotificationById,
}));

vi.mock("../mutations.js", () => ({
  markNotificationAsRead: mockMarkNotificationAsRead,
  markAllNotificationsAsRead: mockMarkAllNotificationsAsRead,
  deleteNotification: mockDeleteNotification,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  notificationsSyncConfig: { streamKeyPrefix: "sync:notifications" },
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: vi.fn(),
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  return notificationsRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
  } as never);
}

describe("notificationsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getUnreadForUser rejects unauthenticated callers", async () => {
    const caller = createCaller();

    await expect(caller.getUnreadForUser("user-1")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  });

  test("getUnreadForUser blocks non-admin access to another user", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getUnreadForUser("user-2")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Cannot fetch other users' notifications",
    });
  });

  test("getUnreadForUser allows admins to fetch another user", async () => {
    const caller = createCaller({ id: "admin-1", role: "admin" });
    mockGetUnreadNotificationsForUser.mockResolvedValue([
      {
        id: "notif-1",
        userId: "user-2",
        type: "ticket_reply",
        title: "Reply",
        body: "A new reply",
      },
    ]);

    const result = await caller.getUnreadForUser("user-2");

    expect(mockGetUnreadNotificationsForUser).toHaveBeenCalledWith("user-2");
    expect(result).toHaveLength(1);
  });

  test("markAllAsRead returns count from mutation result length", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    mockMarkAllNotificationsAsRead.mockResolvedValue([
      { id: "notif-1" },
      { id: "notif-2" },
    ]);

    const result = await caller.markAllAsRead({ userId: "user-1" });

    expect(result).toEqual({ count: 2 });
    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalledWith({
      userId: "user-1",
    });
  });

  test("getById throws NOT_FOUND when notification does not exist", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    mockGetNotificationById.mockResolvedValue(null);

    await expect(caller.getById("notif-missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Notification not found",
    });
  });

  test("getUpdatesSince wraps data layer failures", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    mockGetEntityUpdatesSince.mockRejectedValue(new Error("redis down"));

    await expect(
      caller.getUpdatesSince({ userId: "user-1", since: Date.now() - 10_000 }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch notification updates",
    });
  });
});
