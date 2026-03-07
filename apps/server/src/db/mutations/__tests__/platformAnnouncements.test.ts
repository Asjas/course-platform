import {
  deletePlatformAnnouncementById,
  insertPlatformAnnouncement,
  insertPlatformAnnouncementRead,
  updatePlatformAnnouncementById,
  updatePlatformAnnouncementReadById,
} from "../platformAnnouncements.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockDb, mockLog } = vi.hoisted(() => ({
  mockDb: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockLog: {
    error: vi.fn(),
  },
}));

vi.mock("~/db/index.js", () => ({
  db: mockDb,
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => mockLog,
  },
}));

vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual("drizzle-orm");
  return {
    ...actual,
    eq: vi.fn(() => true),
  };
});

describe("insertPlatformAnnouncement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("inserts platform announcement successfully", async () => {
    const mockAnnouncement = {
      id: "ann:1",
      title: "New Feature",
      message: "We released a new feature!",
      type: "general" as const,
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockAnnouncement]),
      }),
    });

    const result = await insertPlatformAnnouncement({
      newPlatformAnnouncement: mockAnnouncement,
    });

    expect(result).toEqual([mockAnnouncement]);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  test("logs error and throws when insert fails", async () => {
    const dbError = new Error("Insert failed");
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(dbError),
      }),
    });

    await expect(
      insertPlatformAnnouncement({
        newPlatformAnnouncement: {
          id: "ann:2",
          title: "Test",
          message: "Test message",
          type: "general",
        },
      }),
    ).rejects.toThrow("Insert failed");

    expect(mockLog.error).toHaveBeenCalled();
  });
});

describe("updatePlatformAnnouncementById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates platform announcement successfully", async () => {
    const updates = { title: "Updated Title", published: true };

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "ann:1", ...updates }]),
        }),
      }),
    });

    const result = await updatePlatformAnnouncementById({
      id: "ann:1",
      updates,
    });

    expect(result[0]).toMatchObject(updates);
  });

  test("logs error and throws when update fails", async () => {
    const dbError = new Error("Update failed");
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(dbError),
        }),
      }),
    });

    await expect(
      updatePlatformAnnouncementById({
        id: "ann:1",
        updates: { title: "Failed" },
      }),
    ).rejects.toThrow();

    expect(mockLog.error).toHaveBeenCalled();
  });
});

describe("deletePlatformAnnouncementById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes platform announcement successfully", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "ann:1" }]),
      }),
    });

    const result = await deletePlatformAnnouncementById("ann:1");

    expect(result).toEqual([{ id: "ann:1" }]);
  });

  test("logs error and throws when delete fails", async () => {
    const dbError = new Error("Delete failed");
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(dbError),
      }),
    });

    await expect(deletePlatformAnnouncementById("ann:1")).rejects.toThrow();
    expect(mockLog.error).toHaveBeenCalled();
  });
});

describe("insertPlatformAnnouncementRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("inserts announcement read record successfully", async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "read:1",
            announcementId: "ann:1",
            userId: "user:1",
            readAt: expect.any(Date),
          },
        ]),
      }),
    });

    const result = await insertPlatformAnnouncementRead("read:1", {
      announcementId: "ann:1",
      userId: "user:1",
    });

    expect(result[0]).toMatchObject({
      announcementId: "ann:1",
      userId: "user:1",
    });
  });

  test("logs error and throws when insert fails", async () => {
    const dbError = new Error("Insert failed");
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(dbError),
      }),
    });

    await expect(
      insertPlatformAnnouncementRead("read:1", {
        announcementId: "ann:1",
        userId: "user:1",
      }),
    ).rejects.toThrow();

    expect(mockLog.error).toHaveBeenCalled();
  });
});

describe("updatePlatformAnnouncementReadById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates announcement read record successfully", async () => {
    const updates = { readAt: new Date() };

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "read:1", ...updates }]),
        }),
      }),
    });

    const result = await updatePlatformAnnouncementReadById({
      id: "read:1",
      updates,
    });

    expect(result[0]).toMatchObject(updates);
  });

  test("logs error and throws when update fails", async () => {
    const dbError = new Error("Update failed");
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(dbError),
        }),
      }),
    });

    await expect(
      updatePlatformAnnouncementReadById({
        id: "read:1",
        updates: { readAt: new Date() },
      }),
    ).rejects.toThrow();

    expect(mockLog.error).toHaveBeenCalled();
  });
});
