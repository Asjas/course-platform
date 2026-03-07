import {
  getConversationById,
  getDMRequestById,
  getPendingDMRequests,
} from "../queries.js";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/db/index.js", () => ({
  db: {
    query: {
      directMessageConversation: {
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue(null) }),
        }),
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue([]) }),
        }),
      },
      directMessageRequest: {
        findFirst: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue(null) }),
        }),
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue([]) }),
        }),
      },
      user: {
        findMany: vi.fn().mockReturnValue({
          prepare: () => ({ execute: vi.fn().mockResolvedValue([]) }),
        }),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
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
    closedAt: "closedAt",
    requestId: "requestId",
  },
}));

vi.mock("~/db/schema/user.js", () => ({
  user: {
    id: "id",
    name: "name",
    email: "email",
    image: "image",
  },
}));

vi.mock("~/db/schema/index.js", () => ({
  user: {
    id: "id",
    name: "name",
    email: "email",
    image: "image",
  },
}));

describe("getPendingDMRequests", () => {
  test("is an exported function", () => {
    expect(typeof getPendingDMRequests).toBe("function");
  });
});

describe("getDMRequestById", () => {
  test("is an exported function", () => {
    expect(typeof getDMRequestById).toBe("function");
  });
});

describe("getConversationById", () => {
  test("is an exported function", () => {
    expect(typeof getConversationById).toBe("function");
  });
});
