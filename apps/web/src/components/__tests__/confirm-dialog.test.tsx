import { render, screen } from "@testing-library/react";
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
});
