import type { Reaction } from "@apps/server/src/routers/chat";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageReactions } from "~/components/message-reactions";

const mockEmojiPicker = vi.hoisted(() => vi.fn());

vi.mock("react-aria-components", () => ({
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("~/components/emoji-reaction-picker", () => ({
  EmojiReactionPicker: ({
    onEmojiSelect,
    messageAuthor,
    variant,
  }: {
    onEmojiSelect: (emoji: string) => void;
    messageAuthor?: string;
    variant?: "inline" | "action";
  }) => {
    mockEmojiPicker({ messageAuthor, variant });
    return (
      <button
        type="button"
        onClick={() => onEmojiSelect("🔥")}
      >
        Mock Emoji Picker
      </button>
    );
  },
}));

function makeReaction(
  emoji: string,
  users: { userId: string; userName: string }[],
): Reaction {
  return { emoji, users };
}

describe("MessageReactions", () => {
  it("renders nothing when reactions are empty", () => {
    const { container } = render(
      <MessageReactions
        reactions={[]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders reaction button with emoji and count", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("👍", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /👍 reaction from/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onToggleReaction with emoji when reaction button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleReaction = vi.fn();

    render(
      <MessageReactions
        reactions={[makeReaction("🎉", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={onToggleReaction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /🎉 reaction/i }));

    expect(onToggleReaction).toHaveBeenCalledWith("🎉");
  });

  it("uses active styles when current user has reacted", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("💯", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u1"
        onToggleReaction={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /💯 reaction/i });
    expect(button.className).toContain("bg-blue-600/80");
    expect(button.className).toContain("text-white");
  });

  it("uses inactive styles when current user has not reacted", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("💯", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u2"
        onToggleReaction={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /💯 reaction/i });
    expect(button.className).toContain("bg-gray-600/60");
    expect(button.className).toContain("text-gray-200");
  });

  it("uses remove wording in aria-label when current user has reacted", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👏", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u1"
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /click to remove your reaction/i }),
    ).toBeInTheDocument();
  });

  it("uses add wording in aria-label when current user has not reacted", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👏", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u9"
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /click to add your reaction/i }),
    ).toBeInTheDocument();
  });

  it("renders one reaction button per reaction", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("👍", [{ userId: "u1", userName: "Alice" }]),
          makeReaction("❤️", [{ userId: "u2", userName: "Bob" }]),
          makeReaction("🔥", [{ userId: "u3", userName: "Charlie" }]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole("button", { name: /reaction from/i });
    expect(buttons).toHaveLength(3);
  });

  it("renders emoji picker with inline variant", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👍", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(mockEmojiPicker).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "inline" }),
    );
    expect(
      screen.getByRole("button", { name: "Mock Emoji Picker" }),
    ).toBeInTheDocument();
  });

  it("forwards picker emoji selection to onToggleReaction", async () => {
    const user = userEvent.setup();
    const onToggleReaction = vi.fn();

    render(
      <MessageReactions
        reactions={[makeReaction("👍", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={onToggleReaction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mock Emoji Picker" }));

    expect(onToggleReaction).toHaveBeenCalledWith("🔥");
  });
});
