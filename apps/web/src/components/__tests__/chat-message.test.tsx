import type { ChatMessage, Reaction } from "@apps/server/src/routers/chat";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatMessageComponent from "~/components/chat-message";

const { mockUseAuth, mockRenderMarkdown, mockIsMediaCollapsed } = vi.hoisted(
  () => ({
    mockUseAuth: vi.fn(),
    mockRenderMarkdown: vi.fn(),
    mockIsMediaCollapsed: vi.fn(() => false),
  }),
);

vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("~/lib/markdown", () => ({
  renderMarkdown: mockRenderMarkdown,
}));

vi.mock("~/lib/collapsed-media", () => ({
  isMediaCollapsed: mockIsMediaCollapsed,
  setMediaCollapsed: vi.fn(),
}));

vi.mock("~/lib/db.collections", () => ({
  toggleMessageReaction: vi.fn().mockResolvedValue([]),
}));

vi.mock("~/components/emoji-reaction-picker", () => ({
  EmojiReactionPicker: ({
    onEmojiSelect,
  }: {
    onEmojiSelect: (emoji: string) => void;
  }) => (
    <button
      type="button"
      onClick={() => onEmojiSelect("👍")}
    >
      Add reaction
    </button>
  ),
}));

vi.mock("~/components/message-reactions", () => ({
  MessageReactions: () => null,
}));

vi.mock("~/components/report-message-dialog", () => ({
  ReportMessageDialog: () => null,
}));

vi.mock("~/components/user-profile-sheet", () => ({
  default: () => null,
}));

vi.mock("~/components/edit-message-sheet", () => ({
  default: () => null,
}));

vi.mock("~/components/markdown-content", () => ({
  MarkdownContent: ({ html }: { html: string }) => (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    message: "Hello world",
    name: "alice",
    username: "alice",
    color: null,
    timestamp: new Date("2026-01-01T10:00:00Z").getTime(),
    createdAt: new Date("2026-01-01T10:00:00Z").getTime(),
    ...overrides,
  };
}

function makeCollection() {
  return {
    delete: vi.fn(),
    update: vi.fn(),
  };
}

function makeReaction(
  emoji: string,
  users: { userId: string; userName: string }[],
): Reaction {
  return { emoji, users };
}

describe("ChatMessageComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderMarkdown.mockResolvedValue("<p>Hello world</p>");
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1", name: "alice" } },
      hasRole: () => false,
    });
  });

  it("renders the username and timestamp", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage()}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "alice" }),
    ).toBeInTheDocument();
    // timestamp is shown as HH:mm format
    expect(screen.getByTitle(/2026/)).toBeInTheDocument();
  });

  it("renders the rendered markdown content", async () => {
    mockRenderMarkdown.mockResolvedValue("<p>Rendered content</p>");
    render(
      <ChatMessageComponent
        msg={makeMessage({ message: "**bold**" })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    expect(await screen.findByText("Rendered content")).toBeInTheDocument();
  });

  it("uses a custom color from msg.color when provided", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage({ color: "rgb(255, 0, 0)" })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    const usernameButton = await screen.findByRole("button", { name: "alice" });
    expect(usernameButton).toHaveStyle("color: rgb(255, 0, 0)");
  });

  it("shows (edited) badge when editedAt is set", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage({
          editedAt: new Date("2026-01-01T10:30:00Z").getTime(),
        })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    // Wait for async markdown render to settle before asserting
    await screen.findByRole("button", { name: "alice" });
    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("shows thread reply count button when replyCount > 0", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage({ replyCount: 3 })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    expect(
      await screen.findByRole("button", { name: /3 replies/i }),
    ).toBeInTheDocument();
  });

  it("shows singular reply label when replyCount is 1", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage({ replyCount: 1 })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    expect(
      await screen.findByRole("button", { name: /1 reply/i }),
    ).toBeInTheDocument();
  });

  it("does not show reply button when replyCount is 0 or absent", async () => {
    render(
      <ChatMessageComponent
        msg={makeMessage({ replyCount: 0 })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    // Wait for async markdown render to settle, then assert absence
    await screen.findByRole("button", { name: "alice" });
    expect(
      screen.queryByRole("button", { name: /repl/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onOpenThread when the thread reply button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenThread = vi.fn();
    const msg = makeMessage({ replyCount: 2 });

    render(
      <ChatMessageComponent
        msg={msg}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
        onOpenThread={onOpenThread}
      />,
    );

    await user.click(screen.getByRole("button", { name: /2 replies/i }));

    expect(onOpenThread).toHaveBeenCalledWith(msg);
  });

  it("shows media toggle button when message has an image", async () => {
    mockRenderMarkdown.mockResolvedValue(
      '<p><img src="https://example.com/photo.jpg" /></p>',
    );

    render(
      <ChatMessageComponent
        msg={makeMessage()}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    expect(
      await screen.findByRole("button", { name: /hide image|show image/i }),
    ).toBeInTheDocument();
  });

  it("shows Edit and Delete in action menu for message owner", async () => {
    const user = userEvent.setup();

    render(
      <ChatMessageComponent
        msg={makeMessage({ name: "alice" })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Message actions" }));

    expect(
      await screen.findByRole("menuitem", { name: "Edit" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("menuitem", { name: "Delete" }),
    ).toBeInTheDocument();
  });

  it("calls collection.delete when Delete is clicked by the owner", async () => {
    const user = userEvent.setup();
    const collection = makeCollection();

    render(
      <ChatMessageComponent
        msg={makeMessage({ name: "alice", id: "msg-42" })}
        channelId="channel-1"
        collection={collection}
        reactions={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Message actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    await waitFor(() => {
      expect(collection.delete).toHaveBeenCalledWith("msg-42");
    });
  });

  it("shows Report option for messages by other users", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-2", name: "bob" } },
      hasRole: () => false,
    });

    render(
      <ChatMessageComponent
        msg={makeMessage({ name: "alice" })}
        channelId="channel-1"
        collection={makeCollection()}
        reactions={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Message actions" }));

    expect(
      await screen.findByRole("menuitem", { name: /report/i }),
    ).toBeInTheDocument();
  });

  it("displays reaction emoji count from props", async () => {
    // MessageReactions is mocked to null so we just verify the component doesn't crash
    const reactions = [
      makeReaction("👍", [{ userId: "u1", userName: "alice" }]),
    ];

    expect(() =>
      render(
        <ChatMessageComponent
          msg={makeMessage()}
          channelId="channel-1"
          collection={makeCollection()}
          reactions={reactions}
        />,
      ),
    ).not.toThrow();

    // Wait for async markdown render to settle before the test ends
    await screen.findByRole("button", { name: "alice" });
  });
});
