import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MentionPicker } from "~/components/mention-picker";

// jsdom doesn't implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const mockUsers = [
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
];

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockUsers,
    isLoading: false,
  }),
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    mentions: {
      getChannelMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "channel"],
          queryFn: vi.fn(),
        }),
      },
      getDMMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "dm"],
          queryFn: vi.fn(),
        }),
      },
      getSupportTicketMentions: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["mentions", "ticket"],
          queryFn: vi.fn(),
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
    const { container } = render(
      <MentionPicker
        {...defaultProps}
        isOpen={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders user list when open", () => {
    render(<MentionPicker {...defaultProps} />);
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("displays usernames", () => {
    render(<MentionPicker {...defaultProps} />);
    // Username text is rendered inside the component
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("filters users by search query", () => {
    render(
      <MentionPicker
        {...defaultProps}
        searchQuery="alice"
      />,
    );
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("shows 'No users found' when search has no results", () => {
    render(
      <MentionPicker
        {...defaultProps}
        searchQuery="nonexistentuser"
      />,
    );
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("renders a listbox role", () => {
    render(<MentionPicker {...defaultProps} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("applies custom position style", () => {
    const { container } = render(
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
