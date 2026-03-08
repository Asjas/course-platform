import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlockWithCopy } from "~/components/code-block-copy";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CodeBlockWithCopy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a copy button with accessible label", () => {
    render(<CodeBlockWithCopy code="const x = 1;" />);
    expect(
      screen.getByRole("button", { name: "Copy code" }),
    ).toBeInTheDocument();
  });

  it("displays language label when provided", () => {
    render(
      <CodeBlockWithCopy
        code="const x = 1;"
        language="typescript"
      />,
    );
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("does not display language label when not provided", () => {
    render(<CodeBlockWithCopy code="const x = 1;" />);
    expect(screen.queryByText("typescript")).not.toBeInTheDocument();
  });

  it("copies code to clipboard on click", async () => {
    // Set up userEvent first, then spy on the clipboard it configures.
    // Object.defineProperty / Object.assign fail here because userEvent.setup()
    // installs its own clipboard as a getter-only property.
    const user = userEvent.setup();
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<CodeBlockWithCopy code="hello world" />);

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(writeTextSpy).toHaveBeenCalledWith("hello world");
  });

  it("shows error toast when clipboard fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );

    const { toast } = await import("sonner");

    render(<CodeBlockWithCopy code="hello" />);

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to copy code");
    });
  });
});
