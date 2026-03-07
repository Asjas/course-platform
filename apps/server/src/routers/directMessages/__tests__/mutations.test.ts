import { createDMRequest } from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockInsert, mockInsertValues } = vi.hoisted(() => {
  const mockInsertValues = vi.fn().mockReturnThis();
  return {
    mockInsertValues,
    mockInsert: vi.fn().mockReturnValue({ values: mockInsertValues }),
  };
});

vi.mock("~/db/index.js", () => ({
  db: {
    insert: mockInsert,
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    query: {
      directMessageRequest: {
        findFirst: vi.fn(),
      },
      directMessageConversation: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("~/db/schema/directMessages.js", () => ({
  directMessageRequest: {
    id: "id",
    requesterId: "requesterId",
    recipientId: "recipientId",
    status: "status",
  },
  directMessageConversation: {
    id: "id",
    user1Id: "user1Id",
    user2Id: "user2Id",
  },
}));

vi.mock("~/db/schema/userNotifications.js", () => ({
  userNotification: {
    id: "id",
  },
}));

describe("createDMRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ values: mockInsertValues });
  });

  test("creates a pending DM request without auto-approve", async () => {
    const result = await createDMRequest({
      requesterId: "user-1",
      recipientId: "user-2",
      message: "Hello!",
    });

    expect(result).toBeDefined();
    expect(result.requestId).toBeDefined();
    expect(result.autoApproved).toBe(false);
    expect(mockInsert).toHaveBeenCalled();
  });

  test("creates an auto-approved DM request with conversation", async () => {
    const result = await createDMRequest({
      requesterId: "user-1",
      recipientId: "user-2",
      message: "Hello!",
      autoApprove: true,
    });

    expect(result).toBeDefined();
    expect(result.requestId).toBeDefined();
    expect(result.autoApproved).toBe(true);
    if (result.autoApproved) {
      expect(result.conversationId).toBeDefined();
    }
    // insert called twice: once for request, once for conversation
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });
});
