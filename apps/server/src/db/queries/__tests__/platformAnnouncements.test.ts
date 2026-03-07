import {
  getAllAnnouncements,
  getAnnouncementById,
  getPublishedAnnouncements,
  getReadAnnouncementsForUser,
  getUnreadAnnouncementsForUser,
} from "../platformAnnouncements.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockExecute, mockFindMany, createQueryBuilder } = vi.hoisted(() => {
  const mockExecute = vi.fn();
  const mockFindMany = vi.fn();

  // Create a chainable query builder mock
  const createQueryBuilder = () => {
    const builder = {
      select: vi.fn(() => builder),
      from: vi.fn(() => builder),
      leftJoin: vi.fn(() => builder),
      innerJoin: vi.fn(() => builder),
      where: vi.fn(() => builder),
      orderBy: vi.fn(() => builder),
      prepare: vi.fn(() => ({
        execute: mockExecute,
      })),
    };
    return builder;
  };

  return { mockExecute, mockFindMany, createQueryBuilder };
});

vi.mock("~/db/index.js", () => ({
  db: {
    ...createQueryBuilder(),
    query: {
      platformAnnouncement: {
        findMany: vi.fn(() => {
          // Return a thenable object with a prepare method
          const queryResult = {
            then: (resolve: (value: unknown) => void) =>
              mockFindMany().then(resolve),
            prepare: () => ({
              execute: mockExecute,
            }),
          };
          return queryResult;
        }),
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
      },
      platformAnnouncementRead: {
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({
            execute: mockExecute,
          }),
        }),
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

    expect(result).toHaveProperty("announcements");
    expect(result).toHaveProperty("count");
    expect(Array.isArray(result.announcements)).toBe(true);
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
    mockFindMany.mockResolvedValue([
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
