import {
  getChannelHistory,
  getDMHistory,
  getReactionKey,
  getReactionsForMessage,
  getThreadMeta,
  getThreadMetaKey,
  getThreadReplies,
} from "../queries.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    hgetall: vi.fn(),
    xrevrange: vi.fn(),
    xrange: vi.fn(),
    pipeline: vi.fn(),
  },
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({ debug: vi.fn(), error: vi.fn(), info: vi.fn() }),
  },
}));

vi.mock("~/lib/redis.js", () => ({
  redis: mockRedis,
  subscriptionRedis: {},
}));

describe("getReactionKey", () => {
  test("returns correct key format", () => {
    expect(getReactionKey("msg-123")).toBe("chat:reactions:msg-123");
  });

  test("handles different message IDs", () => {
    expect(getReactionKey("abc")).toBe("chat:reactions:abc");
    expect(getReactionKey("01HRXYZ")).toBe("chat:reactions:01HRXYZ");
  });
});

describe("getThreadMetaKey", () => {
  test("returns correct key format", () => {
    expect(getThreadMetaKey("parent-1")).toBe("chat:thread:parent-1:meta");
  });
});

describe("getReactionsForMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns reactions from Redis hash", async () => {
    mockRedis.hgetall.mockResolvedValue({
      "👍": JSON.stringify([
        { userId: "u1", userName: "Alice" },
        { userId: "u2", userName: "Bob" },
      ]),
      "🎉": JSON.stringify([{ userId: "u1", userName: "Alice" }]),
    });

    const reactions = await getReactionsForMessage("msg-1");

    expect(reactions).toHaveLength(2);
    expect(reactions[0]).toEqual({
      emoji: "👍",
      users: [
        { userId: "u1", userName: "Alice" },
        { userId: "u2", userName: "Bob" },
      ],
    });
    expect(reactions[1]).toEqual({
      emoji: "🎉",
      users: [{ userId: "u1", userName: "Alice" }],
    });
  });

  test("returns empty array when no reactions exist", async () => {
    mockRedis.hgetall.mockResolvedValue({});

    const reactions = await getReactionsForMessage("msg-2");
    expect(reactions).toEqual([]);
  });

  test("skips corrupted reaction data", async () => {
    mockRedis.hgetall.mockResolvedValue({
      "👍": "not valid json",
      "🎉": JSON.stringify([{ userId: "u1", userName: "Alice" }]),
    });

    const reactions = await getReactionsForMessage("msg-3");
    expect(reactions).toHaveLength(1);
    expect(reactions[0].emoji).toBe("🎉");
  });

  test("skips non-array reaction data", async () => {
    mockRedis.hgetall.mockResolvedValue({
      "👍": JSON.stringify({ userId: "u1" }),
    });

    const reactions = await getReactionsForMessage("msg-4");
    expect(reactions).toEqual([]);
  });
});

describe("getThreadMeta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns full thread metadata", async () => {
    mockRedis.hgetall.mockResolvedValue({
      replyCount: "5",
      latestReplyAt: "1705312800000",
      latestReplyUserIds: JSON.stringify(["u1", "u2"]),
    });

    const meta = await getThreadMeta("parent-1");

    expect(meta).toEqual({
      replyCount: 5,
      latestReplyAt: 1705312800000,
      latestReplyUserIds: ["u1", "u2"],
    });
  });

  test("returns defaults when no metadata exists", async () => {
    mockRedis.hgetall.mockResolvedValue({});

    const meta = await getThreadMeta("parent-2");

    expect(meta).toEqual({
      replyCount: 0,
      latestReplyAt: null,
      latestReplyUserIds: [],
    });
  });

  test("handles corrupted replyCount", async () => {
    mockRedis.hgetall.mockResolvedValue({
      replyCount: "not-a-number",
    });

    const meta = await getThreadMeta("parent-3");
    expect(meta.replyCount).toBeNaN();
  });
});

describe("getChannelHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns sorted messages with reactions and thread metadata", async () => {
    const msg1 = {
      id: "msg-1",
      message: "Hello!",
      name: "Alice",
      username: "alice",
      color: null,
      timestamp: 1705312800000,
      createdAt: 1705312800000,
    };
    const msg2 = {
      id: "msg-2",
      message: "Hi there!",
      name: "Bob",
      username: "bob",
      color: null,
      timestamp: 1705312700000,
      createdAt: 1705312700000,
    };

    // xrevrange returns entries as [streamId, [key, jsonValue]]
    mockRedis.xrevrange.mockResolvedValue([
      ["1705312800000-0", ["data", JSON.stringify(msg1)]],
      ["1705312700000-0", ["data", JSON.stringify(msg2)]],
    ]);

    // Pipeline for reactions + thread meta
    const mockPipelineExec = vi.fn().mockResolvedValue([
      [null, {}], // reactions for msg1
      [null, {}], // thread meta for msg1
      [null, {}], // reactions for msg2
      [null, {}], // thread meta for msg2
    ]);
    mockRedis.pipeline.mockReturnValue({
      hgetall: vi.fn().mockReturnThis(),
      exec: mockPipelineExec,
    });

    const messages = await getChannelHistory("general");

    expect(messages).toHaveLength(2);
    // Sorted by createdAt ascending
    expect(messages[0].message).toBe("Hi there!");
    expect(messages[1].message).toBe("Hello!");
  });

  test("returns empty array for empty channel", async () => {
    mockRedis.xrevrange.mockResolvedValue([]);

    const messages = await getChannelHistory("empty-channel");
    expect(messages).toEqual([]);
  });

  test("respects custom limit parameter", async () => {
    mockRedis.xrevrange.mockResolvedValue([]);

    await getChannelHistory("general", 10);

    expect(mockRedis.xrevrange).toHaveBeenCalledWith(
      "chat:channel:general:messages",
      "+",
      "-",
      "COUNT",
      20, // limit * 2 to account for thread reply filtering
    );
  });
});

describe("getDMHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns sorted DM messages with reactions", async () => {
    const msg = {
      id: "dm-1",
      message: "DM Hello!",
      name: "Alice",
      username: "alice",
      color: null,
      timestamp: 1705312800000,
      createdAt: 1705312800000,
    };

    mockRedis.xrevrange.mockResolvedValue([
      ["1705312800000-0", ["data", JSON.stringify(msg)]],
    ]);

    const mockPipelineExec = vi.fn().mockResolvedValue([
      [null, {}], // reactions for dm-1
    ]);
    mockRedis.pipeline.mockReturnValue({
      hgetall: vi.fn().mockReturnThis(),
      exec: mockPipelineExec,
    });

    const messages = await getDMHistory("conv-1");

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("DM Hello!");
  });

  test("returns empty array for empty conversation", async () => {
    mockRedis.xrevrange.mockResolvedValue([]);

    const messages = await getDMHistory("empty-conv");
    expect(messages).toEqual([]);
  });
});

describe("getThreadReplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns sorted thread replies ascending", async () => {
    const reply1 = {
      id: "reply-1",
      message: "First reply",
      name: "Alice",
      username: "alice",
      color: null,
      timestamp: 1705312700000,
      createdAt: 1705312700000,
      parentMessageId: "parent-1",
    };
    const reply2 = {
      id: "reply-2",
      message: "Second reply",
      name: "Bob",
      username: "bob",
      color: null,
      timestamp: 1705312800000,
      createdAt: 1705312800000,
      parentMessageId: "parent-1",
    };
    const otherMsg = {
      id: "msg-other",
      message: "Not a reply",
      name: "Charlie",
      username: "charlie",
      color: null,
      timestamp: 1705312600000,
      createdAt: 1705312600000,
    };

    mockRedis.xrange.mockResolvedValue([
      ["1705312600000-0", ["data", JSON.stringify(otherMsg)]],
      ["1705312700000-0", ["data", JSON.stringify(reply1)]],
      ["1705312800000-0", ["data", JSON.stringify(reply2)]],
    ]);

    const mockPipelineExec = vi.fn().mockResolvedValue([
      [null, {}],
      [null, {}],
    ]);
    mockRedis.pipeline.mockReturnValue({
      hgetall: vi.fn().mockReturnThis(),
      exec: mockPipelineExec,
    });

    const replies = await getThreadReplies("general", "parent-1");

    expect(replies).toHaveLength(2);
    expect(replies[0].message).toBe("First reply");
    expect(replies[1].message).toBe("Second reply");
  });

  test("returns empty array when no replies exist", async () => {
    mockRedis.xrange.mockResolvedValue([]);

    const replies = await getThreadReplies("general", "parent-1");
    expect(replies).toEqual([]);
  });
});
