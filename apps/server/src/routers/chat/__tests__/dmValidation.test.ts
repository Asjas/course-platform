import { validateDMConversationAccess } from "../dmValidation.js";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockFindFirst } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}));

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      directMessageConversation: {
        findFirst: mockFindFirst,
      },
    },
  },
}));

vi.mock("~/db/schema/directMessages.js", () => ({
  directMessageConversation: {
    id: "id",
  },
}));

describe("validateDMConversationAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("throws NOT_FOUND when conversation does not exist", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    await expect(
      validateDMConversationAccess("conv-1", "user-1", "student"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Conversation not found",
    });
  });

  test("allows participant to read conversation", async () => {
    const conversation = {
      id: "conv-1",
      user1Id: "user-1",
      user2Id: "user-2",
    };
    mockFindFirst.mockResolvedValue(conversation);

    const result = await validateDMConversationAccess(
      "conv-1",
      "user-1",
      "student",
    );

    expect(result).toEqual(conversation);
  });

  test("allows admin to read non-participant conversation", async () => {
    const conversation = {
      id: "conv-1",
      user1Id: "user-1",
      user2Id: "user-2",
    };
    mockFindFirst.mockResolvedValue(conversation);

    const result = await validateDMConversationAccess(
      "conv-1",
      "admin-1",
      "admin",
    );

    expect(result).toEqual(conversation);
  });

  test("blocks non-participant non-admin for read access", async () => {
    mockFindFirst.mockResolvedValue({
      id: "conv-1",
      user1Id: "user-1",
      user2Id: "user-2",
    });

    await expect(
      validateDMConversationAccess("conv-1", "user-3", "student"),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Unauthorized: You do not have access to this conversation",
    });
  });

  test("blocks admin from write-only access when not participant", async () => {
    mockFindFirst.mockResolvedValue({
      id: "conv-1",
      user1Id: "user-1",
      user2Id: "user-2",
    });

    await expect(
      validateDMConversationAccess("conv-1", "admin-1", "admin", true),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message:
        "Unauthorized: You can only send messages in your own conversations",
    });
  });

  test("allows participant for write-only access", async () => {
    const conversation = {
      id: "conv-1",
      user1Id: "user-1",
      user2Id: "user-2",
    };
    mockFindFirst.mockResolvedValue(conversation);

    const result = await validateDMConversationAccess(
      "conv-1",
      "user-2",
      "student",
      true,
    );

    expect(result).toEqual(conversation);
  });

  test("throws TRPCError instances", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    try {
      await validateDMConversationAccess("conv-1", "user-1", "student");
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
    }
  });
});
