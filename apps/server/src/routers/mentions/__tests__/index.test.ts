import { mentionsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockSmembers,
  mockSadd,
  mockExpire,
  mockSrem,
  mockUserFindMany,
  mockConversationFindFirst,
  mockSupportTicketFindFirst,
} = vi.hoisted(() => ({
  mockSmembers: vi.fn(),
  mockSadd: vi.fn(),
  mockExpire: vi.fn(),
  mockSrem: vi.fn(),
  mockUserFindMany: vi.fn(),
  mockConversationFindFirst: vi.fn(),
  mockSupportTicketFindFirst: vi.fn(),
}));

vi.mock("~/lib/redis.js", () => ({
  redis: {
    smembers: mockSmembers,
    sadd: mockSadd,
    expire: mockExpire,
    srem: mockSrem,
  },
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      user: {
        findMany: mockUserFindMany,
      },
      directMessageConversation: {
        findFirst: mockConversationFindFirst,
      },
      supportTicket: {
        findFirst: mockSupportTicketFindFirst,
      },
    },
  },
}));

function createCaller(user: { id: string; role: string }) {
  const hasRole = (role: string) => user.role === role;
  return mentionsRouter.createCaller({ user, hasRole } as never);
}

describe("mentionsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getChannelMentions uses cached members and excludes current user", async () => {
    mockSmembers.mockResolvedValue(["user-1", "user-2", "user-3"]);
    mockUserFindMany.mockResolvedValue([
      {
        id: "user-2",
        name: "Alice",
        username: "alice",
        displayUsername: "alice",
        image: null,
      },
      {
        id: "user-3",
        name: "Bob",
        username: "bob",
        displayUsername: "bob",
        image: null,
      },
    ]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getChannelMentions({ channelId: "general" });

    expect(mockSmembers).toHaveBeenCalledWith("chat:channel:general:members");
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
  });

  test("getChannelMentions falls back to DB when cache is empty", async () => {
    mockSmembers.mockResolvedValue([]);
    mockUserFindMany.mockResolvedValue([
      {
        id: "user-2",
        name: "Alice",
        username: "alice",
        displayUsername: "alice",
        image: null,
      },
    ]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getChannelMentions({ channelId: "general" });

    expect(result).toHaveLength(1);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
  });

  test("getDMMentions returns empty array when conversation is missing", async () => {
    mockConversationFindFirst.mockResolvedValue(undefined);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getDMMentions({ conversationId: "dm-1" });

    expect(result).toEqual([]);
  });

  test("getDMMentions returns the other participant", async () => {
    mockConversationFindFirst.mockResolvedValue({
      user1: {
        id: "user-1",
        name: "Self",
        username: "self",
        displayUsername: "self",
        image: null,
      },
      user2: {
        id: "user-2",
        name: "Other",
        username: "other",
        displayUsername: "other",
        image: null,
      },
    });

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getDMMentions({ conversationId: "dm-1" });

    expect(result).toEqual([
      {
        id: "user-2",
        name: "Other",
        username: "other",
        displayUsername: "other",
        image: null,
      },
    ]);
  });

  test("getSupportTicketMentions includes admins for non-admin users", async () => {
    mockSupportTicketFindFirst.mockResolvedValue({
      user: {
        id: "owner-1",
        name: "Owner",
        username: "owner",
        displayUsername: "owner",
        image: null,
      },
      comments: [{ userId: "commenter-1" }],
    });

    mockUserFindMany
      .mockResolvedValueOnce([{ id: "admin-1" }])
      .mockResolvedValueOnce([
        {
          id: "admin-1",
          name: "Admin",
          username: "admin",
          displayUsername: "admin",
          image: null,
        },
        {
          id: "commenter-1",
          name: "Commenter",
          username: "commenter",
          displayUsername: "commenter",
          image: null,
        },
        {
          id: "owner-1",
          name: "Owner",
          username: "owner",
          displayUsername: "owner",
          image: null,
        },
      ]);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getSupportTicketMentions({ ticketId: "t-1" });

    expect(result.map((u) => u.id).sort()).toEqual([
      "admin-1",
      "commenter-1",
      "owner-1",
    ]);
  });

  test("getSupportTicketMentions returns empty array when ticket is missing", async () => {
    mockSupportTicketFindFirst.mockResolvedValue(undefined);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.getSupportTicketMentions({ ticketId: "t-1" });

    expect(result).toEqual([]);
  });

  test("joinChannel tracks user and sets expiry", async () => {
    mockSadd.mockResolvedValue(1);
    mockExpire.mockResolvedValue(1);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.joinChannel({ channelId: "general" });

    expect(mockSadd).toHaveBeenCalledWith(
      "chat:channel:general:members",
      "user-1",
    );
    expect(mockExpire).toHaveBeenCalledWith(
      "chat:channel:general:members",
      3600,
    );
    expect(result).toEqual({ success: true });
  });

  test("leaveChannel removes user from channel set", async () => {
    mockSrem.mockResolvedValue(1);

    const caller = createCaller({ id: "user-1", role: "student" });
    const result = await caller.leaveChannel({ channelId: "general" });

    expect(mockSrem).toHaveBeenCalledWith(
      "chat:channel:general:members",
      "user-1",
    );
    expect(result).toEqual({ success: true });
  });
});
