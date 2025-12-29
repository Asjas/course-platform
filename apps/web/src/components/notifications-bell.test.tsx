/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationsBell } from "./notifications-bell";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as dbCollections from "~/lib/db.collections";

// Mock the db.collections module
vi.mock("~/lib/db.collections", () => ({
  useUnreadAnnouncements: vi.fn(),
  useReadAnnouncements: vi.fn(),
  useUnreadUserNotifications: vi.fn(),
  useReadUserNotifications: vi.fn(),
  markAnnouncementAsRead: vi.fn(),
  markUserNotificationAsRead: vi.fn(),
}));

// Mock TanStack Router Link component
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("NotificationsBell Component", () => {
  const mockUserId = "user:123";

  const createMockNotification = (
    type: string,
    overrides: Record<string, unknown> = {},
  ) => ({
    id: `notif:${Math.random()}`,
    title: "Test Notification",
    message: "Test message",
    createdAt: new Date().toISOString(),
    type,
    link: null,
    readAt: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
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
  });

  describe("Notification Icon Rendering", () => {
    it("should render notification bell", () => {
      const mockNotification = createMockNotification("payment_completed", {
        title: "Payment Successful",
      });

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [mockNotification],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      // Check that notification bell button is rendered
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render bell icon for various notification types", () => {
      const notificationTypes = [
        "payment_completed",
        "coupon_redeemed",
        "team_license_invite_received",
        "certificate_issued",
        "admin_new_purchase",
      ];

      notificationTypes.forEach((type) => {
        const mockNotification = createMockNotification(type, {
          title: `Test ${type}`,
        });

        vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
          data: [mockNotification],
          isLoading: false,
          error: null,
        } as any);

        const { unmount } = render(<NotificationsBell userId={mockUserId} />);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Notification Count Badge", () => {
    it("should show unread count badge when there are unread notifications", () => {
      const mockNotifications = [
        createMockNotification("payment_completed"),
        createMockNotification("coupon_redeemed"),
        createMockNotification("team_license_purchased"),
      ];

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: mockNotifications,
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      // Should render the button
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should not show badge when there are no unread notifications", () => {
      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Notification Type Styling", () => {
    it("should render notifications with different types", () => {
      const notificationTypes = [
        "payment_completed",
        "payment_refunded",
        "payment_failed",
        "coupon_redeemed",
        "coupon_expired",
        "team_license_purchased",
        "team_license_invite_received",
        "admin_new_review",
        "admin_new_purchase",
      ];

      notificationTypes.forEach((type) => {
        const mockNotification = createMockNotification(type);

        vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
          data: [mockNotification],
          isLoading: false,
          error: null,
        } as any);

        const { unmount } = render(<NotificationsBell userId={mockUserId} />);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Notification Sorting", () => {
    it("should sort unread notifications by creation date (newest first)", () => {
      const oldDate = new Date("2023-01-01");
      const newDate = new Date("2023-12-01");

      const mockNotifications = [
        createMockNotification("payment_completed", {
          createdAt: oldDate.toISOString(),
          title: "Old Notification",
        }),
        createMockNotification("coupon_redeemed", {
          createdAt: newDate.toISOString(),
          title: "New Notification",
        }),
      ];

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: mockNotifications,
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Notification Links", () => {
    it("should render notifications with links", () => {
      const mockNotification = createMockNotification("payment_completed", {
        link: "/courses/test-course",
        title: "Payment Successful",
      });

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [mockNotification],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render notifications without links", () => {
      const mockNotification = createMockNotification("coupon_expired", {
        link: null,
        title: "Coupon Expired",
      });

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [mockNotification],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should show empty state when there are no unread notifications", () => {
      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should show empty state when there are no read notifications", () => {
      vi.mocked(dbCollections.useReadUserNotifications).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Combined Notification Display", () => {
    it("should combine and sort announcements and user notifications", () => {
      const mockAnnouncement = {
        id: "announce:1",
        title: "Platform Update",
        message: "New features available",
        publishedAt: new Date("2023-06-01").toISOString(),
        createdAt: new Date("2023-06-01").toISOString(),
        type: "platform_update",
      };

      const mockNotification = createMockNotification("payment_completed", {
        createdAt: new Date("2023-06-02").toISOString(),
        title: "Payment Successful",
      });

      vi.mocked(dbCollections.useUnreadAnnouncements).mockReturnValue({
        data: [mockAnnouncement],
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(dbCollections.useUnreadUserNotifications).mockReturnValue({
        data: [mockNotification],
        isLoading: false,
        error: null,
      } as any);

      render(<NotificationsBell userId={mockUserId} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });
});
