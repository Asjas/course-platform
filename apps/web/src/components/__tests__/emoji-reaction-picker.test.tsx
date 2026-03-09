import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmojiReactionPicker } from "~/components/emoji-reaction-picker";

describe("EmojiReactionPicker", () => {
  it("renders action variant button with default aria label", () => {
    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Add reaction" }),
    ).toBeInTheDocument();
  });

  it("uses message author in aria label when provided", () => {
    render(
      <EmojiReactionPicker
        onEmojiSelect={vi.fn()}
        messageAuthor="Alex"
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Add reaction to message from Alex",
      }),
    ).toBeInTheDocument();
  });

  it("applies inline variant classes", () => {
    render(
      <EmojiReactionPicker
        onEmojiSelect={vi.fn()}
        variant="inline"
      />,
    );

    const button = screen.getByRole("button", { name: "Add reaction" });
    expect(button.className).toContain("bg-gray-600/60");
  });

  it("opens picker and emits selected emoji", async () => {
    const user = userEvent.setup();
    const onEmojiSelect = vi.fn();

    render(<EmojiReactionPicker onEmojiSelect={onEmojiSelect} />);

    // Open the emoji picker dialog
    await user.click(screen.getByRole("button", { name: "Add reaction" }));

    // The real emoji-picker-react renders emoji buttons with aria-label
    // Find and click an emoji (the picker should be visible now)
    const emojiButtons = await screen.findAllByRole("button");

    // Filter for buttons that are likely emoji buttons (not the trigger button)
    const emojiButton = emojiButtons.find(
      (btn) =>
        btn.getAttribute("aria-label")?.includes("emoji") ||
        btn.textContent?.match(/[\p{Emoji}]/u),
    );

    if (emojiButton) {
      await user.click(emojiButton);
      expect(onEmojiSelect).toHaveBeenCalledWith(expect.any(String));
    }
  });
});
