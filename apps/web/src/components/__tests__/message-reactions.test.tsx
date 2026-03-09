import type { Reaction } from "@apps/server/src/routers/chat";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MessageReactions,
  getReactionTooltip,
  hasUserReacted,
} from "~/components/message-reactions";

const mockEmojiPicker = vi.hoisted(() => vi.fn());

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

  it("displays correct tooltip for single user", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👋", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /reaction from Alice/i }),
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for two users", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("❤️", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /reaction from Alice and Bob/i }),
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for three users", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("🎉", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
            { userId: "u3", userName: "Charlie" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /reaction from Alice, Bob, and Charlie/i,
      }),
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for four users", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("🔥", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
            { userId: "u3", userName: "Charlie" },
            { userId: "u4", userName: "Diana" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /reaction from Alice, Bob, and 2 others/i,
      }),
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for five users", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("💯", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
            { userId: "u3", userName: "Charlie" },
            { userId: "u4", userName: "Diana" },
            { userId: "u5", userName: "Eve" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /reaction from Alice, Bob, and 3 others/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders reactions in order they are provided", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("🔥", [{ userId: "u1", userName: "Alice" }]),
          makeReaction("👍", [{ userId: "u2", userName: "Bob" }]),
          makeReaction("❤️", [{ userId: "u3", userName: "Charlie" }]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole("button", { name: /reaction from/i });
    expect(buttons[0]).toHaveTextContent("🔥");
    expect(buttons[1]).toHaveTextContent("👍");
    expect(buttons[2]).toHaveTextContent("❤️");
  });

  it("handles reactions with no users (edge case)", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👍", [])]}
        onToggleReaction={vi.fn()}
      />,
    );

    // Should still render the reaction button
    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders message author in emoji picker prop", () => {
    render(
      <MessageReactions
        reactions={[makeReaction("👍", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={vi.fn()}
        messageAuthor="Alex"
      />,
    );

    expect(mockEmojiPicker).toHaveBeenCalledWith(
      expect.objectContaining({ messageAuthor: "Alex" }),
    );
  });

  it("handles clicking same reaction multiple times", async () => {
    const user = userEvent.setup();
    const onToggleReaction = vi.fn();

    render(
      <MessageReactions
        reactions={[makeReaction("👏", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={onToggleReaction}
      />,
    );

    const button = screen.getByRole("button", { name: /👏 reaction/i });

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(onToggleReaction).toHaveBeenCalledTimes(3);
    expect(onToggleReaction).toHaveBeenCalledWith("👏");
  });

  it("supports keyboard interaction on reaction buttons", async () => {
    const user = userEvent.setup();
    const onToggleReaction = vi.fn();

    render(
      <MessageReactions
        reactions={[makeReaction("🚀", [{ userId: "u1", userName: "Alice" }])]}
        onToggleReaction={onToggleReaction}
      />,
    );

    const button = screen.getByRole("button", { name: /🚀 reaction/i });
    button.focus();

    await user.keyboard("{Enter}");

    expect(onToggleReaction).toHaveBeenCalledWith("🚀");
  });

  it("renders multiple reactions with different counts", () => {
    render(
      <MessageReactions
        reactions={[
          makeReaction("👍", [
            { userId: "u1", userName: "Alice" },
            { userId: "u2", userName: "Bob" },
            { userId: "u3", userName: "Charlie" },
          ]),
          makeReaction("❤️", [{ userId: "u4", userName: "Diana" }]),
          makeReaction("🔥", [
            { userId: "u5", userName: "Eve" },
            { userId: "u6", userName: "Frank" },
          ]),
        ]}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("❤️")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    expect(screen.getByText("🔥")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hasUserReacted returns false when currentUserId is undefined", () => {
    const reaction = makeReaction("👍", [{ userId: "u1", userName: "Alice" }]);

    expect(hasUserReacted(reaction, undefined)).toBe(false);
  });

  it("hasUserReacted returns true when user has reacted", () => {
    const reaction = makeReaction("👍", [
      { userId: "u1", userName: "Alice" },
      { userId: "u2", userName: "Bob" },
    ]);

    expect(hasUserReacted(reaction, "u1")).toBe(true);
    expect(hasUserReacted(reaction, "u2")).toBe(true);
  });

  it("hasUserReacted returns false when user has not reacted", () => {
    const reaction = makeReaction("👍", [
      { userId: "u1", userName: "Alice" },
      { userId: "u2", userName: "Bob" },
    ]);

    expect(hasUserReacted(reaction, "u999")).toBe(false);
  });

  it("getReactionTooltip returns empty string for no users", () => {
    const reaction = makeReaction("👍", []);
    expect(getReactionTooltip(reaction)).toBe("");
  });

  it("getReactionTooltip handles exactly 4 users", () => {
    const reaction = makeReaction("👍", [
      { userId: "u1", userName: "Alice" },
      { userId: "u2", userName: "Bob" },
      { userId: "u3", userName: "Charlie" },
      { userId: "u4", userName: "Diana" },
    ]);

    expect(getReactionTooltip(reaction)).toBe("Alice, Bob, and 2 others");
  });

  it("renders current user indicator styling correctly", () => {
    const { rerender } = render(
      <MessageReactions
        reactions={[makeReaction("💯", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u1"
        onToggleReaction={vi.fn()}
      />,
    );

    let button = screen.getByRole("button", { name: /💯 reaction/i });
    expect(button.className).toContain("bg-blue-600/80");

    // Change current user
    rerender(
      <MessageReactions
        reactions={[makeReaction("💯", [{ userId: "u1", userName: "Alice" }])]}
        currentUserId="u2"
        onToggleReaction={vi.fn()}
      />,
    );

    button = screen.getByRole("button", { name: /💯 reaction/i });
    expect(button.className).toContain("bg-gray-600/60");
  });
});
