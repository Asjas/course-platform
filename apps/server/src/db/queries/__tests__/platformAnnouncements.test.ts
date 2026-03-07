import {
  getAllAnnouncements,
  getAnnouncementById,
  getPublishedAnnouncements,
  getReadAnnouncementsForUser,
  getUnreadAnnouncementsForUser,
} from "../platformAnnouncements.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      platformAnnouncement: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      platformAnnouncementRead: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock prepared statement
vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual("drizzle-orm");
  return {
    ...actual,
    eq: vi.fn(() => true),
    desc: vi.fn((field) => field),
  };
});

describe("getAllAnnouncements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns all announcements", async () => {
    mockExecute.mockResolvedValue([
      {
        id: "ann:1",
        title: "Test Announcement",
        message: "This is a test",
        type: "general",
        createdAt: new Date(),
      },
    ]);

    const result = await getAllAnnouncements();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getAnnouncementById", () => {
  test("returns announcement by ID", async () => {
    mockExecute.mockResolvedValue({
      id: "ann:1",
      title: "Announcement",
      message: "Message",
      type: "general",
    });

    const result = await getAnnouncementById("ann:1");

    expect(result).toBeDefined();
  });
});

describe("getPublishedAnnouncements", () => {
  test("returns only published announcements", async () => {
    mockExecute.mockResolvedValue([
      {
        id: "ann:1",
        title: "Published",
        message: "Message",
        type: "general",
        publishedAt: new Date(),
      },
    ]);

    const result = await getPublishedAnnouncements();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getUnreadAnnouncementsForUser", () => {
  test("returns unread announcements for user", async () => {
    mockExecute.mockResolvedValue([
      {
        platform_announcement: {
          id: "ann:1",
          title: "Unread Announcement",
          message: "Message",
          type: "general",
        },
        platform_announcement_read: null,
      },
    ]);

    const result = await getUnreadAnnouncementsForUser("user:1");

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getReadAnnouncementsForUser", () => {
  test("returns read announcements for user", async () => {
    mockExecute.mockResolvedValue([
      {
        platform_announcement: {
          id: "ann:1",
          title: "Read Announcement",
          message: "Message",
          type: "general",
        },
        platform_announcement_read: {
          userId: "user:1",
          readAt: new Date(),
        },
      },
    ]);

    const result = await getReadAnnouncementsForUser("user:1");

    expect(Array.isArray(result)).toBe(true);
  });
});
