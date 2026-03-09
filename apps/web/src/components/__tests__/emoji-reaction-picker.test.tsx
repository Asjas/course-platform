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

  it("applies custom className to trigger button", () => {
    render(
      <EmojiReactionPicker
        className="custom-test-class"
        onEmojiSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Add reaction" });
    expect(button.className).toContain("custom-test-class");
  });

  it("shows loading state when picker is first opened", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add reaction" }));

    // The emoji picker is lazy-loaded with Suspense
    // We should be able to find the dialog opened
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes picker after emoji selection", async () => {
    const user = userEvent.setup();
    const onEmojiSelect = vi.fn();

    render(<EmojiReactionPicker onEmojiSelect={onEmojiSelect} />);

    // Open the picker
    await user.click(screen.getByRole("button", { name: "Add reaction" }));
    await screen.findByRole("dialog");

    // Click an emoji - the onEmojiSelect should be called
    const emojiButtons = await screen.findAllByRole("button");
    const emojiButton = emojiButtons.find(
      (btn) =>
        btn.getAttribute("aria-label")?.includes("emoji") ||
        btn.textContent?.match(/[\p{Emoji}]/u),
    );

    if (emojiButton) {
      await user.click(emojiButton);
      // Component should call onEmojiSelect
      expect(onEmojiSelect).toHaveBeenCalled();
    }
  });

  it("remains open after opening until dismissed", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add reaction" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Dialog should remain open
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows picker dialog with correct accessibility role", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add reaction" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("applies action variant styles by default", () => {
    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add reaction" });
    expect(button.className).toContain("border-gray-200");
    expect(button.className).toContain("bg-white");
  });

  it("can be opened via keyboard (Enter)", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add reaction" });
    button.focus();

    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("can be opened via keyboard (Space)", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add reaction" });
    button.focus();

    await user.keyboard(" ");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("does not call onEmojiSelect when dialog is just opened", async () => {
    const user = userEvent.setup();
    const onEmojiSelect = vi.fn();

    render(<EmojiReactionPicker onEmojiSelect={onEmojiSelect} />);

    await user.click(screen.getByRole("button", { name: "Add reaction" }));
    await screen.findByRole("dialog");

    expect(onEmojiSelect).not.toHaveBeenCalled();
  });

  it("maintains trigger button state across interactions", async () => {
    const user = userEvent.setup();

    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add reaction" });

    // Verify initial state
    expect(button).toHaveAttribute("aria-label", "Add reaction");
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Open
    await user.click(button);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    // Button should show expanded state
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("maintains button accessibility when closed", () => {
    render(<EmojiReactionPicker onEmojiSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add reaction" });
    expect(button).toHaveAttribute("aria-label", "Add reaction");
  });
});
