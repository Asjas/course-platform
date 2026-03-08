import { supportTicketsRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockInsertSupportTicket,
  mockInsertSupportTicketComment,
  mockDeleteSupportTicketById,
  mockGetSupportTicketById,
  mockGetSupportTicketCountsByCourse,
  mockNotifyAdminNewSupportTicket,
  mockInsertUserNotification,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
  mockStreamEntityUpdates,
} = vi.hoisted(() => ({
  mockInsertSupportTicket: vi.fn(),
  mockInsertSupportTicketComment: vi.fn(),
  mockDeleteSupportTicketById: vi.fn(),
  mockGetSupportTicketById: vi.fn(),
  mockGetSupportTicketCountsByCourse: vi.fn(),
  mockNotifyAdminNewSupportTicket: vi.fn(),
  mockInsertUserNotification: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
  mockStreamEntityUpdates: vi.fn(),
}));

vi.mock("~/config.js", () => ({
  default: {
    SUPPORT_ASSIGNED_TO_USER_ID: "admin-assignee-1",
  },
}));

vi.mock("~/routers/support-tickets/mutations.js", () => ({
  insertSupportTicket: mockInsertSupportTicket,
  insertSupportTicketComment: mockInsertSupportTicketComment,
  deleteSupportTicketById: mockDeleteSupportTicketById,
}));

vi.mock("~/routers/support-tickets/queries.js", () => ({
  getSupportTicketById: mockGetSupportTicketById,
  getSupportTicketCountsByCourse: mockGetSupportTicketCountsByCourse,
}));

vi.mock("~/lib/notifications.js", () => ({
  notifyAdminNewSupportTicket: mockNotifyAdminNewSupportTicket,
}));

vi.mock("~/routers/notifications/mutations.js", () => ({
  insertUserNotification: mockInsertUserNotification,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  supportTicketsSyncConfig: { streamKeyPrefix: "sync:support-tickets" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: mockStreamEntityUpdates,
}));

interface TestUser {
  id: string;
  role: string;
  name?: string;
}

function createCaller(user: TestUser) {
  const cache = {
    getSupportTicketById: vi.fn(),
    getAllSupportTickets: vi.fn(),
    invalidateAll: vi.fn(),
  };

  const server = {
    cache,
    to: async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
      try {
        const value = await promise;
        return [null, value];
      } catch (error) {
        return [error as Error, null];
      }
    },
  };

  const caller = supportTicketsRouter.createCaller({
    user: {
      id: user.id,
      role: user.role,
      name: user.name ?? "Test User",
    },
    hasRole: (role: string) => user.role === role,
    request: {
      log: {
        error: vi.fn(),
        debug: vi.fn(),
      },
    },
    reply: {
      server,
    },
  } as never);

  return { caller, cache };
}

describe("supportTicketsRouter authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
  });

  test("allows anyone (authenticated or not) to view a support ticket", async () => {
    const ticket = {
      id: "ticket-1",
      title: "Public support ticket",
      userId: "owner-1",
      comments: [],
    };

    const { caller, cache } = createCaller({
      id: "viewer-1",
      role: "member",
    });

    cache.getSupportTicketById.mockResolvedValue(ticket);

    const result = await caller.getSupportTicketById({ ticketId: "ticket-1" });

    expect(result).toEqual(ticket);
  });

  test("allows unauthenticated users to view support tickets", async () => {
    const ticket = {
      id: "ticket-public",
      title: "Completely public ticket",
      userId: "owner-2",
      comments: [],
    };

    // Create caller without user (simulating unauthenticated access)
    const cache = {
      getSupportTicketById: vi.fn(),
      getAllSupportTickets: vi.fn(),
      invalidateAll: vi.fn(),
    };

    const server = {
      cache,
      to: async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
        try {
          const value = await promise;
          return [null, value];
        } catch (error) {
          return [error as Error, null];
        }
      },
    };

    const caller = supportTicketsRouter.createCaller({
      user: undefined as never,
      hasRole: () => false,
      request: {
        log: {
          error: vi.fn(),
          debug: vi.fn(),
        },
      },
      reply: {
        server,
      },
    } as never);

    cache.getSupportTicketById.mockResolvedValue(ticket);

    const result = await caller.getSupportTicketById({
      ticketId: "ticket-public",
    });

    expect(result).toEqual(ticket);
  });

  test("createSupportTicket always assigns ctx user as owner", async () => {
    mockInsertSupportTicket.mockImplementation(async ({ newSupportTicket }) => {
      return {
        ...newSupportTicket,
        comments: [],
      };
    });

    const { caller } = createCaller({
      id: "creator-1",
      role: "member",
      name: "Creator",
    });

    await caller.createSupportTicket({
      id: "ticket-2",
      title: "Need help with a lesson",
      description: "Details",
      repo: null,
      priority: "medium",
      status: "open",
      moduleId: null,
      lessonId: null,
    });

    expect(mockInsertSupportTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        newSupportTicket: expect.objectContaining({
          userId: "creator-1",
          assignedToUserId: "admin-assignee-1",
        }),
      }),
    );
  });

  test("deleteSupportTicket rejects non-owner non-admin", async () => {
    mockGetSupportTicketById.mockResolvedValue({
      id: "ticket-3",
      userId: "owner-1",
    });

    const { caller } = createCaller({
      id: "other-user-1",
      role: "member",
    });

    await expect(
      caller.deleteSupportTicket({ ticketId: "ticket-3" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You are not authorized to delete this ticket",
    });

    expect(mockDeleteSupportTicketById).not.toHaveBeenCalled();
  });

  test("deleteSupportTicket allows owner", async () => {
    mockGetSupportTicketById.mockResolvedValue({
      id: "ticket-4",
      userId: "owner-1",
    });

    mockDeleteSupportTicketById.mockResolvedValue({
      id: "ticket-4",
      userId: "owner-1",
      title: "Owner ticket",
    });

    const { caller, cache } = createCaller({
      id: "owner-1",
      role: "member",
    });

    const result = await caller.deleteSupportTicket({ ticketId: "ticket-4" });

    expect(result).toMatchObject({ id: "ticket-4", userId: "owner-1" });
    expect(mockDeleteSupportTicketById).toHaveBeenCalledWith({
      ticketId: "ticket-4",
    });
    expect(cache.invalidateAll).toHaveBeenCalled();
  });

  test("deleteSupportTicket allows admin to delete any ticket", async () => {
    mockGetSupportTicketById.mockResolvedValue({
      id: "ticket-5",
      userId: "owner-1",
    });

    mockDeleteSupportTicketById.mockResolvedValue({
      id: "ticket-5",
      userId: "owner-1",
      title: "Admin can delete this",
    });

    const { caller, cache } = createCaller({
      id: "admin-1",
      role: "admin",
    });

    const result = await caller.deleteSupportTicket({ ticketId: "ticket-5" });

    expect(result).toMatchObject({ id: "ticket-5", userId: "owner-1" });
    expect(mockDeleteSupportTicketById).toHaveBeenCalledWith({
      ticketId: "ticket-5",
    });
    expect(cache.invalidateAll).toHaveBeenCalled();
  });
});
