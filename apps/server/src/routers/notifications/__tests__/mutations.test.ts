import {
  deleteNotification,
  insertUserNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotification,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { db } from "~/db/index.js";

vi.mock("~/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "notif:test", userId: "user:1" }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "notif:test", userId: "user:1" }]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "notif:test", userId: "user:1" }]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/userNotifications.js", () => ({
  userNotification: {
    id: "id",
    userId: "userId",
    readAt: "readAt",
  },
}));

const mockDb = vi.mocked(db);

describe("insertUserNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([
            { id: "notif:01", userId: "user:1", type: "ticket_reply" },
          ]),
      }),
    } as never);
  });

  test("inserts a notification and returns it", async () => {
    const result = await insertUserNotification({
      newNotification: {
        userId: "user:1",
        type: "ticket_reply",
      } as never,
    });

    expect(result).toBeDefined();
    expect(result.userId).toBe("user:1");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("markNotificationAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([
              { id: "notif:01", userId: "user:1", readAt: new Date() },
            ]),
        }),
      }),
    } as never);
  });

  test("marks a notification as read", async () => {
    const result = await markNotificationAsRead({
      notificationId: "notif:01",
      userId: "user:1",
    });

    expect(result).toBeDefined();
    expect(result.readAt).toBeDefined();
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("markAllNotificationsAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: "notif:01", readAt: new Date() },
            { id: "notif:02", readAt: new Date() },
          ]),
        }),
      }),
    } as never);
  });

  test("marks all notifications as read for a user", async () => {
    const result = await markAllNotificationsAsRead({ userId: "user:1" });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe("deleteNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "notif:01", userId: "user:1" }]),
      }),
    } as never);
  });

  test("deletes a notification", async () => {
    const result = await deleteNotification({
      notificationId: "notif:01",
      userId: "user:1",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe("notif:01");
    expect(mockDb.delete).toHaveBeenCalled();
  });
});

describe("updateNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "notif:01", type: "mention" }]),
        }),
      }),
    } as never);
  });

  test("updates a notification", async () => {
    const result = await updateNotification({
      notificationId: "notif:01",
      updates: { type: "mention" } as never,
    });

    expect(result).toBeDefined();
    expect(mockDb.update).toHaveBeenCalled();
  });
});
