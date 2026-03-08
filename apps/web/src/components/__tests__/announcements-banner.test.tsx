import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementsBanner } from "~/components/announcements/AnnouncementsBanner";

const { mockMarkAsRead, mockUseUnread, mockUseRead } = vi.hoisted(() => ({
  mockMarkAsRead: vi.fn().mockResolvedValue(undefined),
  mockUseUnread: vi.fn(),
  mockUseRead: vi.fn(),
}));

vi.mock("~/lib/db.collections", () => ({
  useUnreadAnnouncements: mockUseUnread,
  useReadAnnouncements: mockUseRead,
  markAnnouncementAsRead: mockMarkAsRead,
}));

function makeAnnouncement(overrides: {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  publishedAt?: string | null;
  readAt?: string | null;
}) {
  return {
    id: "ann-1",
    title: "Test Announcement",
    message: "This is the announcement body.",
    type: "general" as const,
    publishedAt: "2024-01-15T10:00:00Z",
    ...overrides,
  };
}

describe("AnnouncementsBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnread.mockReturnValue({ data: [] });
    mockUseRead.mockReturnValue({ data: [] });
  });

  it("renders nothing when there are no active announcements", () => {
    const { container } = render(<AnnouncementsBanner userId="user-1" />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the Announcements heading and active announcement content when unread items exist", () => {
    mockUseUnread.mockReturnValue({
      data: [
        makeAnnouncement({
          title: "New Feature!",
          message: "We added something great.",
        }),
      ],
    });

    render(<AnnouncementsBanner userId="user-1" />);

    expect(
      screen.getByRole("heading", { name: "Announcements" }),
    ).toBeInTheDocument();
    expect(screen.getByText("New Feature!")).toBeInTheDocument();
    expect(screen.getByText("We added something great.")).toBeInTheDocument();
  });

  it("shows the active announcement count in the Active tab button", () => {
    mockUseUnread.mockReturnValue({
      data: [
        makeAnnouncement({ id: "a1", title: "First" }),
        makeAnnouncement({ id: "a2", title: "Second" }),
      ],
    });

    render(<AnnouncementsBanner userId="user-1" />);

    expect(
      screen.getByRole("button", { name: /active \(2\)/i }),
    ).toBeInTheDocument();
  });

  it("calls markAnnouncementAsRead with the correct IDs when the dismiss button is clicked", async () => {
    const user = userEvent.setup();
    mockUseUnread.mockReturnValue({
      data: [makeAnnouncement({ id: "ann-42", title: "Dismiss me" })],
    });

    render(<AnnouncementsBanner userId="user-1" />);

    await user.click(
      screen.getByRole("button", { name: "Dismiss announcement" }),
    );

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith({
        announcementId: "ann-42",
        userId: "user-1",
      });
    });
  });

  it("switches to the Dismissed tab and shows dismissed announcements", async () => {
    const user = userEvent.setup();
    mockUseUnread.mockReturnValue({
      data: [makeAnnouncement({ title: "Active item" })],
    });
    mockUseRead.mockReturnValue({
      data: [
        makeAnnouncement({
          id: "read-1",
          title: "Old News",
          message: "Already seen this.",
          readAt: "2024-01-14T09:00:00Z",
        }),
      ],
    });

    render(<AnnouncementsBanner userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /dismissed/i }));

    expect(screen.getByText("Old News")).toBeInTheDocument();
    expect(screen.getByText("Already seen this.")).toBeInTheDocument();
    expect(screen.queryByText("Active item")).not.toBeInTheDocument();
  });

  it("shows 'No dismissed announcements' message when dismissed tab is empty", async () => {
    const user = userEvent.setup();
    mockUseUnread.mockReturnValue({
      data: [makeAnnouncement({ title: "Active" })],
    });
    mockUseRead.mockReturnValue({ data: [] });

    render(<AnnouncementsBanner userId="user-1" />);

    await user.click(screen.getByRole("button", { name: /dismissed/i }));

    expect(screen.getByText("No dismissed announcements")).toBeInTheDocument();
  });
});
