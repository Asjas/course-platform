import {
  getNotificationById,
  getReadNotificationsForUser,
  getUnreadNotificationsForUser,
} from "../queries.js";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      userNotification: {
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
    },
  },
}));

vi.mock("~/db/schema/userNotifications.js", () => ({
  userNotification: {
    id: "id",
    userId: "userId",
    readAt: "readAt",
    createdAt: "createdAt",
  },
}));

describe("getUnreadNotificationsForUser", () => {
  test("is an exported function", () => {
    expect(typeof getUnreadNotificationsForUser).toBe("function");
  });

  test("returns an array", async () => {
    const result = await getUnreadNotificationsForUser("user:1");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getReadNotificationsForUser", () => {
  test("is an exported function", () => {
    expect(typeof getReadNotificationsForUser).toBe("function");
  });

  test("returns an array", async () => {
    const result = await getReadNotificationsForUser("user:1");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getNotificationById", () => {
  test("is an exported function", () => {
    expect(typeof getNotificationById).toBe("function");
  });

  test("accepts a notificationId parameter", async () => {
    const result = await getNotificationById("notif:123");
    expect(result).toBeNull();
  });
});
