import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BlockerComponent from "~/components/blocker";

const mockProceed = vi.fn();
const mockReset = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Block: ({
    children,
    shouldBlockFn,
  }: {
    children: (props: {
      status: string;
      proceed: () => void;
      reset: () => void;
    }) => React.ReactNode;
    shouldBlockFn: () => boolean;
    withResolver: boolean;
  }) => {
    const shouldBlock = shouldBlockFn();
    return (
      <div data-testid="block-wrapper">
        {children({
          status: shouldBlock ? "blocked" : "idle",
          proceed: mockProceed,
          reset: mockReset,
        })}
      </div>
    );
  },
}));

describe("BlockerComponent", () => {
  it("does not show dialog when form is not dirty", () => {
    render(<BlockerComponent formIsDirty={false} />);
    expect(
      screen.queryByText(/you have unsaved changes/i),
    ).not.toBeInTheDocument();
  });

  it("shows dialog when form is dirty", () => {
    render(<BlockerComponent formIsDirty={true} />);
    expect(
      screen.getByText(/you have unsaved changes in the form/i),
    ).toBeInTheDocument();
  });

  it("renders with alertdialog role when blocked", () => {
    render(<BlockerComponent formIsDirty={true} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("has aria-modal set to true", () => {
    render(<BlockerComponent formIsDirty={true} />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby and aria-describedby attributes", () => {
    render(<BlockerComponent formIsDirty={true} />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "blocker-title");
    expect(dialog).toHaveAttribute("aria-describedby", "blocker-description");
  });

  it("renders leave and stay buttons when blocked", () => {
    render(<BlockerComponent formIsDirty={true} />);
    expect(
      screen.getByRole("button", { name: /yes, leave/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /no, stay/i }),
    ).toBeInTheDocument();
  });

  it("calls proceed when 'Yes, leave' is clicked", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<BlockerComponent formIsDirty={true} />);
    const leaveButton = screen.getByRole("button", { name: /yes, leave/i });
    await user.click(leaveButton);
    expect(mockProceed).toHaveBeenCalled();
  });

  it("calls reset when 'No, stay' is clicked", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<BlockerComponent formIsDirty={true} />);
    const stayButton = screen.getByRole("button", { name: /no, stay/i });
    await user.click(stayButton);
    expect(mockReset).toHaveBeenCalled();
  });
});
