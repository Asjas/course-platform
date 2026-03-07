import { fireEvent, render, screen } from "@testing-library/react";
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
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<CodeBlockWithCopy code="hello world" />);

    const button = screen.getByRole("button", { name: "Copy code" });
    fireEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith("hello world");
  });

  it("shows error toast when clipboard fails", async () => {
    const { toast } = await import("sonner");
    const writeTextMock = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<CodeBlockWithCopy code="hello" />);

    const button = screen.getByRole("button", { name: "Copy code" });
    await fireEvent.click(button);

    // Wait for the async handler
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to copy code");
    });
  });
});
