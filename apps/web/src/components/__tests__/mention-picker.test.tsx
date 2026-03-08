import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MentionPicker } from "~/components/mention-picker";
import { renderWithQueryClient } from "~/test-utils";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// mockUsers must be defined via vi.hoisted because vi.mock is hoisted above all
// variable declarations — referencing a plain const from the factory would fail.
const { mockUsers } = vi.hoisted(() => ({
  mockUsers: [
    {
      id: "user:1",
      name: "Alice Johnson",
      username: "alice",
      displayUsername: "@alice",
      image: null,
    },
    {
      id: "user:2",
      name: "Bob Smith",
      username: "bob",
      displayUsername: "@bob",
      image: "https://example.com/bob.jpg",
    },
  ],
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    mentions: {
      getChannelMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "channel"],
          queryFn: vi.fn().mockResolvedValue(mockUsers),
        }),
      },
      getDMMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "dm"],
          queryFn: vi.fn().mockResolvedValue(mockUsers),
        }),
      },
      getSupportTicketMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "ticket"],
          queryFn: vi.fn().mockResolvedValue(mockUsers),
        }),
      },
    },
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSelectUser: vi.fn(),
  context: { type: "channel" as const, channelId: "general" },
};

describe("MentionPicker", () => {
  it("renders nothing when not open", () => {
    const { container } = renderWithQueryClient(
      <MentionPicker
        {...defaultProps}
        isOpen={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders user list when open", async () => {
    renderWithQueryClient(<MentionPicker {...defaultProps} />);
    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(await screen.findByText("Bob Smith")).toBeInTheDocument();
  });

  it("filters users by search query", async () => {
    renderWithQueryClient(
      <MentionPicker
        {...defaultProps}
        searchQuery="alice"
      />,
    );
    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("shows 'No users found' when search has no results", async () => {
    renderWithQueryClient(
      <MentionPicker
        {...defaultProps}
        searchQuery="nonexistentuser"
      />,
    );
    expect(await screen.findByText("No users found")).toBeInTheDocument();
  });

  it("renders a listbox role", async () => {
    renderWithQueryClient(<MentionPicker {...defaultProps} />);
    await screen.findByText("Alice Johnson");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("applies custom position style", async () => {
    const { container } = renderWithQueryClient(
      <MentionPicker
        {...defaultProps}
        position={{ top: 100, left: 200 }}
      />,
    );
    const picker = container.firstChild as HTMLElement;
    expect(picker.style.top).toBe("100px");
    expect(picker.style.left).toBe("200px");
  });
});
