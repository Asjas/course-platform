import { announcementsRouter } from "../index.js";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockGetAllAnnouncements,
  mockGetPublishedAnnouncements,
  mockGetUnreadAnnouncementsForUser,
  mockGetReadAnnouncementsForUser,
  mockGetAnnouncementById,
  mockInsertPlatformAnnouncement,
  mockUpdatePlatformAnnouncementById,
  mockDeletePlatformAnnouncementById,
  mockInsertPlatformAnnouncementRead,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
  mockStreamEntityUpdates,
} = vi.hoisted(() => ({
  mockGetAllAnnouncements: vi.fn(),
  mockGetPublishedAnnouncements: vi.fn(),
  mockGetUnreadAnnouncementsForUser: vi.fn(),
  mockGetReadAnnouncementsForUser: vi.fn(),
  mockGetAnnouncementById: vi.fn(),
  mockInsertPlatformAnnouncement: vi.fn(),
  mockUpdatePlatformAnnouncementById: vi.fn(),
  mockDeletePlatformAnnouncementById: vi.fn(),
  mockInsertPlatformAnnouncementRead: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
  mockStreamEntityUpdates: vi.fn(),
}));

vi.mock("~/db/queries/platformAnnouncements.js", () => ({
  getAllAnnouncements: mockGetAllAnnouncements,
  getPublishedAnnouncements: mockGetPublishedAnnouncements,
  getUnreadAnnouncementsForUser: mockGetUnreadAnnouncementsForUser,
  getReadAnnouncementsForUser: mockGetReadAnnouncementsForUser,
  getAnnouncementById: mockGetAnnouncementById,
}));

vi.mock("~/db/mutations/platformAnnouncements.js", () => ({
  insertPlatformAnnouncement: mockInsertPlatformAnnouncement,
  updatePlatformAnnouncementById: mockUpdatePlatformAnnouncementById,
  deletePlatformAnnouncementById: mockDeletePlatformAnnouncementById,
  insertPlatformAnnouncementRead: mockInsertPlatformAnnouncementRead,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  announcementsSyncConfig: { streamKeyPrefix: "sync:announcements" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: mockStreamEntityUpdates,
}));

function createCaller(user: { id: string; role: string }) {
  const hasRole = (role: string) => user.role === role;
  return announcementsRouter.createCaller({ user, hasRole } as never);
}

describe("announcementsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
    mockStreamEntityUpdates.mockReturnValue(
      (async function* () {
        yield { id: "event-1", type: "created", entityId: "a-1" };
      })(),
    );
  });

  test("getAll returns announcement summary", async () => {
    mockGetAllAnnouncements.mockResolvedValue({ announcements: [], count: 0 });

    const caller = createCaller({ id: "admin-1", role: "admin" });
    const result = await caller.getAll();

    expect(result).toEqual({ announcements: [], count: 0 });
  });

  test("getPublished returns published announcements", async () => {
    mockGetPublishedAnnouncements.mockResolvedValue([{ id: "a-1" }]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getPublished();

    expect(result).toEqual([{ id: "a-1" }]);
  });

  test("getUnreadForUser forbids non-owner non-admin", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getUnreadForUser("user-2")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Cannot fetch other users' announcements",
    });
  });

  test("getReadForUser allows owner and returns data", async () => {
    mockGetReadAnnouncementsForUser.mockResolvedValue([{ id: "a-1" }]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getReadForUser("user-1");

    expect(result).toEqual([{ id: "a-1" }]);
  });

  test("getById throws NOT_FOUND when record is missing", async () => {
    mockGetAnnouncementById.mockResolvedValue(undefined);

    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getById("a-404")).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Announcement not found",
    });
  });

  test("create inserts announcement and publishes when publishedAt exists", async () => {
    mockInsertPlatformAnnouncement.mockResolvedValue([
      { id: "a-1", publishedAt: new Date("2026-03-01T00:00:00.000Z") },
    ]);

    const caller = createCaller({ id: "admin-1", role: "admin" });
    const result = await caller.create({
      id: "a-1",
      title: "Title",
      message: "Message",
      type: "general",
      publishedAt: "2026-03-01T00:00:00.000Z",
    });

    expect(result.id).toBe("a-1");
    expect(mockInsertPlatformAnnouncement).toHaveBeenCalledTimes(1);
    expect(mockCreateSyncUpdate).toHaveBeenCalledWith(
      "created",
      "a-1",
      expect.any(Object),
      "admin-1",
    );
    expect(mockPublishEntityChange).toHaveBeenCalledTimes(1);
  });

  test("update throws NOT_FOUND when no rows updated", async () => {
    mockUpdatePlatformAnnouncementById.mockResolvedValue([]);

    const caller = createCaller({ id: "admin-1", role: "admin" });

    await expect(
      caller.update({ id: "a-1", updates: { title: "Updated" } }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Announcement not found",
    });
  });

  test("delete returns success and publishes deletion update", async () => {
    mockDeletePlatformAnnouncementById.mockResolvedValue([{ id: "a-1" }]);

    const caller = createCaller({ id: "admin-1", role: "admin" });
    const result = await caller.delete("a-1");

    expect(result).toEqual({ success: true });
    expect(mockCreateSyncUpdate).toHaveBeenCalledWith(
      "deleted",
      "a-1",
      null,
      "admin-1",
    );
    expect(mockPublishEntityChange).toHaveBeenCalledTimes(1);
  });

  test("markAsRead forbids writing reads for other non-admin users", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });

    await expect(
      caller.markAsRead({
        id: "read-1",
        announcementId: "a-1",
        userId: "user-2",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Cannot mark other users' announcements as read",
    });
  });

  test("getUpdatesSince returns updates from sync store", async () => {
    const updates = [{ id: "u-1", type: "updated", entityId: "a-1" }];
    mockGetEntityUpdatesSince.mockResolvedValue(updates);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getUpdatesSince({ since: Date.now() - 1000 });

    expect(result).toEqual(updates);
  });

  test("subscribeToUpdates yields stream events", async () => {
    const caller = createCaller({ id: "user-1", role: "student" });
    const stream = await caller.subscribeToUpdates({ lastEventId: "0-0" });

    const first = await stream[Symbol.asyncIterator]().next();

    expect(first.value).toEqual({
      id: "event-1",
      type: "created",
      entityId: "a-1",
    });
    expect(mockStreamEntityUpdates).toHaveBeenCalledTimes(1);
  });

  test("rethrows TRPCError and wraps unknown errors", async () => {
    mockGetAllAnnouncements.mockRejectedValue(new Error("db failed"));
    const caller = createCaller({ id: "admin-1", role: "admin" });

    await expect(caller.getAll()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch announcements",
    });

    mockGetAnnouncementById.mockRejectedValue(
      new TRPCError({ code: "FORBIDDEN", message: "blocked" }),
    );

    await expect(caller.getById("a-1")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "blocked",
    });
  });
});
