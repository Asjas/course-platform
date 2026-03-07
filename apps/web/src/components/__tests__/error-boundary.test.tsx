import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundaryComponent from "~/components/error-boundary";

const mockInvalidate = vi.fn();
const mockReset = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    invalidate: mockInvalidate,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryErrorResetBoundary: () => ({
    reset: mockReset,
  }),
}));

describe("ErrorBoundaryComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the error message", () => {
    render(
      <ErrorBoundaryComponent error={new Error("Something went wrong")} />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("displays support message", () => {
    render(<ErrorBoundaryComponent error={new Error("Test error")} />);
    expect(
      screen.getByText(/This error has been logged automatically/),
    ).toBeInTheDocument();
  });

  it("renders a reload button", () => {
    render(<ErrorBoundaryComponent error={new Error("Test error")} />);
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });

  it("calls router.invalidate when reload button is clicked", () => {
    render(<ErrorBoundaryComponent error={new Error("Test error")} />);
    const button = screen.getByRole("button", { name: "Reload page" });
    fireEvent.click(button);
    expect(mockInvalidate).toHaveBeenCalledOnce();
  });

  it("resets query error boundary on mount", () => {
    render(<ErrorBoundaryComponent error={new Error("Test error")} />);
    expect(mockReset).toHaveBeenCalledOnce();
  });
});
