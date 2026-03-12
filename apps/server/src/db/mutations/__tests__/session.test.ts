import { deleteSessionByToken, deleteSessionByUserId } from "../session.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockReturning } = vi.hoisted(() => ({
  mockReturning: vi.fn(),
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: vi.fn().mockReturnValue({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    }),
  },
}));

vi.mock("~/db/index.js", () => ({
  db: {
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
  },
}));

vi.mock("~/db/schema/user.js", () => ({
  session: {
    token: "token",
    userId: "userId",
  },
}));

describe("deleteSessionByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof deleteSessionByToken).toBe("function");
  });

  test("returns deleted session on success", async () => {
    const mockDeleted = [{ id: "sess:1", token: "abc123", userId: "user:1" }];
    mockReturning.mockResolvedValueOnce(mockDeleted);

    const result = await deleteSessionByToken("abc123");
    expect(result).toEqual(mockDeleted);
  });

  test("returns empty array when token not found", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await deleteSessionByToken("nonexistent-token");
    expect(result).toEqual([]);
  });

  test("throws when database operation fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Delete failed"));

    await expect(deleteSessionByToken("abc123")).rejects.toThrow(
      "Delete failed",
    );
  });
});

describe("deleteSessionByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is an exported function", () => {
    expect(typeof deleteSessionByUserId).toBe("function");
  });

  test("returns deleted sessions on success", async () => {
    const mockDeleted = [
      { id: "sess:1", userId: "user:1" },
      { id: "sess:2", userId: "user:1" },
    ];
    mockReturning.mockResolvedValueOnce(mockDeleted);

    const result = await deleteSessionByUserId("user:1");
    expect(result).toEqual(mockDeleted);
    expect(result).toHaveLength(2);
  });

  test("returns empty array when user has no sessions", async () => {
    mockReturning.mockResolvedValueOnce([]);

    const result = await deleteSessionByUserId("user:nonexistent");
    expect(result).toEqual([]);
  });

  test("throws when database operation fails", async () => {
    mockReturning.mockRejectedValueOnce(new Error("Connection lost"));

    await expect(deleteSessionByUserId("user:1")).rejects.toThrow(
      "Connection lost",
    );
  });
});
