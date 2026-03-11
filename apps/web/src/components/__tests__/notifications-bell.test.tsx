/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationsBell } from "../notifications-bell";
import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbCollections from "~/lib/db.collections";

vi.mock("~/lib/db.collections", () => ({
  useUnreadAnnouncements: vi.fn(),
  useReadAnnouncements: vi.fn(),
  useUnreadUserNotifications: vi.fn(),
  useReadUserNotifications: vi.fn(),
  markAnnouncementAsRead: vi.fn(),
  markUserNotificationAsRead: vi.fn(),
}));

vi.mock("~/components/dm-request-sheet", () => ({
  DMRequestSheet: ({ requestId }: { requestId: string }) => (
    <div data-testid="dm-request-sheet">{requestId}</div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    onClick,
  }: {
    children: React.ReactNode;
    to: string;
    onClick?: () => void;
  }) => (
    <a
      href={to}
      onClick={onClick}
    >
      {children}
    </a>
  ),
}));

describe("NotificationsBell", () => {
  const mockUserId = faker.string.uuid();

  function createMockUserNotification(
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      message: faker.lorem.sentence(),
      createdAt: faker.date.recent().toISOString(),
      type: "general",
      link: null,
      dmRequestId: null,
      readAt: null,
      ...overrides,
    };
  }

  function createMockAnnouncement(
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      message: faker.lorem.sentence(),
      createdAt: faker.date.recent().toISOString(),
      publishedAt: faker.date.recent().toISOString(),
      type: "general",
      readAt: null,
      ...overrides,
    };
  }

  async function openPopover(): Promise<void> {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
  }

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(dbCollections.useReadAnnouncements).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(dbCollections.useReadUserNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(dbCollections.markAnnouncementAsRead).mockResolvedValue(
      undefined,
    );
    vi.mocked(dbCollections.markUserNotificationAsRead).mockResolvedValue(
      undefined,
    );
  });

  it("renders bell button", () => {
    render(<NotificationsBell userId={mockUserId} />);

    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });

  it("shows unread badge and count in New tab when unread items exist", async () => {
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({ title: "First" }),
        createMockUserNotification({ title: "Second" }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);

    const button = screen.getByRole("button", { name: "Notifications" });
    const unreadDot = button.querySelector("span.absolute");
    expect(unreadDot).toBeInTheDocument();

    await openPopover();
    expect(screen.getByRole("button", { name: "New (2)" })).toBeInTheDocument();
  });

  it("does not show unread badge when there are no unread items", () => {
    render(<NotificationsBell userId={mockUserId} />);

    const button = screen.getByRole("button", { name: "Notifications" });
    const unreadDot = button.querySelector("span.absolute");
    expect(unreadDot).not.toBeInTheDocument();
  });

  it("shows no-new empty state in New tab", async () => {
    render(<NotificationsBell userId={mockUserId} />);

    await openPopover();
    expect(screen.getByText("No new notifications")).toBeInTheDocument();
  });

  it("shows no-read empty state when switching to Read tab", async () => {
    const user = userEvent.setup();
    render(<NotificationsBell userId={mockUserId} />);

    await openPopover();
    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(screen.getByText("No read notifications")).toBeInTheDocument();
  });

  it("sorts unread announcements and notifications by newest created date", async () => {
    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          title: "Older announcement",
          publishedAt: "2026-03-01T00:00:00.000Z",
          createdAt: "2026-03-01T00:00:00.000Z",
          type: "platform_update",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Newest user notification",
          createdAt: "2026-03-10T00:00:00.000Z",
          type: "payment_completed",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    const titles = screen.getAllByRole("heading", { level: 4 });
    expect(titles[0]).toHaveTextContent("Newest user notification");
    expect(titles[1]).toHaveTextContent("Older announcement");
  });

  it("uses createdAt when announcement publishedAt is null", async () => {
    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          title: "Created date fallback",
          publishedAt: null,
          createdAt: "2026-03-08T00:00:00.000Z",
          type: "warning",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    expect(screen.getByText("Created date fallback")).toBeInTheDocument();
  });

  it("dismisses unread announcement via dismiss button", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          id: "announcement-1",
          title: "Announcement item",
          type: "platform_warning",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(dbCollections.markAnnouncementAsRead).toHaveBeenCalledWith({
      announcementId: "announcement-1",
      userId: mockUserId,
    });
  });

  it("dismisses unread user notification via dismiss button", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          id: "user-notification-1",
          title: "User notification",
          type: "payment_failed",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(dbCollections.markUserNotificationAsRead).toHaveBeenCalledWith({
      notificationId: "user-notification-1",
      userId: mockUserId,
    });
  });

  it("renders unread linked notification as anchor", async () => {
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Linked item",
          type: "coupon_redeemed",
          link: "/courses/test-course",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    const link = screen.getByRole("link", { name: /Linked item/i });
    expect(link).toHaveAttribute("href", "/courses/test-course");
  });

  it("opens DM request sheet and marks notification as read", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          id: "dm-notification-1",
          title: "DM request",
          type: "dm_request_received",
          dmRequestId: "dmreq-123",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(screen.getByRole("button", { name: /DM request/i }));

    expect(screen.getByTestId("dm-request-sheet")).toHaveTextContent(
      "dmreq-123",
    );
    expect(dbCollections.markUserNotificationAsRead).toHaveBeenCalledWith({
      notificationId: "dm-notification-1",
      userId: mockUserId,
    });
  });

  it("renders read notifications sorted by readAt date", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useReadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Older read",
          type: "review_approved",
          readAt: "2026-03-05T00:00:00.000Z",
        }),
        createMockUserNotification({
          title: "Newest read",
          type: "review_approved",
          readAt: "2026-03-09T00:00:00.000Z",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();
    await user.click(screen.getByRole("button", { name: "Read" }));

    const titles = screen.getAllByRole("heading", { level: 4 });
    expect(titles[0]).toHaveTextContent("Newest read");
    expect(titles[1]).toHaveTextContent("Older read");
    expect(screen.getAllByText(/Dismissed/i)).toHaveLength(2);
  });

  it("renders read linked notifications as anchor", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useReadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Read with link",
          type: "course_enrollment",
          link: "/dashboard",
          readAt: "2026-03-08T00:00:00.000Z",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();
    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(
      screen.getByRole("link", { name: /Read with link/i }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("closes popover with close notifications button", async () => {
    const user = userEvent.setup();
    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(
      screen.getByRole("button", { name: "Close notifications" }),
    );

    expect(screen.queryByText("No new notifications")).not.toBeInTheDocument();
  });

  it("renders non-linked unread notification as a plain container", async () => {
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Plain unread",
          type: "general",
          link: null,
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    expect(screen.getByText("Plain unread")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Plain unread/i }),
    ).not.toBeInTheDocument();
  });

  it("does not open DM request sheet when dm request id is missing", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          id: "dm-notification-no-id",
          title: "DM request without id",
          type: "dm_request_received",
          dmRequestId: null,
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(
      screen.getByRole("button", { name: /DM request without id/i }),
    );

    expect(screen.queryByTestId("dm-request-sheet")).not.toBeInTheDocument();
    expect(dbCollections.markUserNotificationAsRead).not.toHaveBeenCalled();
  });

  it("keeps New tab active by default", async () => {
    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    expect(screen.getByRole("button", { name: "New" })).toHaveClass(
      "bg-green-600",
    );
  });

  it("switches active styles when Read tab is selected", async () => {
    const user = userEvent.setup();
    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(screen.getByRole("button", { name: "Read" })).toHaveClass(
      "bg-green-600",
    );
    expect(screen.getByRole("button", { name: "New" })).not.toHaveClass(
      "bg-green-600",
    );
  });

  it("renders unread announcement linkless item as non-anchor", async () => {
    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          title: "Announcement without link",
          type: "course_update",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    expect(screen.getByText("Announcement without link")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Announcement without link/i }),
    ).not.toBeInTheDocument();
  });

  it("renders read announcements in read tab", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useReadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          title: "Read announcement",
          type: "platform_update",
          readAt: "2026-03-06T00:00:00.000Z",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();
    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(screen.getByText("Read announcement")).toBeInTheDocument();
  });

  it("falls back to general color classes for unknown user notification type", async () => {
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Unknown subtype",
          type: "unknown_type_value",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    const itemTitle = screen.getByText("Unknown subtype");
    const container = itemTitle.closest("div.rounded-lg.border.p-3");
    expect(container).toHaveClass("bg-gray-50");
  });

  it("falls back to general color classes for unknown announcement type", async () => {
    vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
      data: [
        createMockAnnouncement({
          title: "Unknown announcement subtype",
          type: "unexpected_announcement_type",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();

    const itemTitle = screen.getByText("Unknown announcement subtype");
    const container = itemTitle.closest("div.rounded-lg.border.p-3");
    expect(container).toHaveClass("bg-gray-50");
  });

  it("does not call mark as read when a standard linked notification is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          id: "linked-no-mark",
          title: "Normal linked",
          type: "course_enrollment",
          link: "/dashboard",
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();
    await user.click(screen.getByRole("link", { name: /Normal linked/i }));

    expect(dbCollections.markUserNotificationAsRead).not.toHaveBeenCalled();
  });

  it("renders read item dismissed text even when readAt is missing", async () => {
    const user = userEvent.setup();
    vi.mocked(dbCollections.useReadUserNotifications).mockReturnValue({
      data: [
        createMockUserNotification({
          title: "Read without timestamp",
          type: "general",
          readAt: null,
        }),
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationsBell userId={mockUserId} />);
    await openPopover();
    await user.click(screen.getByRole("button", { name: "Read" }));

    expect(screen.getByText(/Dismissed/i)).toBeInTheDocument();
  });
});
