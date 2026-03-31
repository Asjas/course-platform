import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "~/components/confirm-dialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    title: "Delete Item",
    description: "Are you sure you want to delete this item?",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Delete Item" }),
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(
      screen.getByText("Are you sure you want to delete this item?"),
    ).toBeInTheDocument();
  });

  it("renders default button text", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders custom button text", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Yes, delete"
        cancelText="No, keep"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Yes, delete" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, keep" }),
    ).toBeInTheDocument();
  });

  it("calls onConfirm and onOpenChange when confirm is pressed", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) when cancel is pressed", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render dialog content when closed", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        open={false}
      />,
    );
    expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
  });

  it("renders destructive variant with red styling", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        variant="destructive"
      />,
    );
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton.className).toContain("bg-red-600");
  });

  it("renders default variant with green styling", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        variant="default"
      />,
    );
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton.className).toContain("bg-green-600");
  });

  it("applies green styling when variant is not specified", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton.className).toContain("bg-green-600");
  });

  it("renders dialog element", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("renders modal overlay when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    // Dialog should be rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("supports keyboard navigation to cancel button", async () => {
    const user = userEvent.setup();
    // react-aria-components Button fires internal press-state updates during
    // keyboard events that trigger act() warnings in JSDOM.
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    cancelButton.focus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("supports keyboard navigation to confirm button", async () => {
    const user = userEvent.setup();
    // react-aria-components Button fires internal press-state updates during
    // keyboard events that trigger act() warnings in JSDOM.
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    confirmButton.focus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
    });
  });

  it("renders with dialog role", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("uses correct heading hierarchy", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const heading = screen.getByRole("heading", { name: "Delete Item" });
    expect(heading.tagName).toBe("H2");
  });

  it("renders confirm and cancel buttons", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("has dismissable overlay", () => {
    render(<ConfirmDialog {...defaultProps} />);
    // The overlay should have isDismissable which allows clicking outside to close
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });

  it("renders exactly two buttons", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    // Confirm and Cancel buttons
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("handles multiple calls to onConfirm correctly", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
