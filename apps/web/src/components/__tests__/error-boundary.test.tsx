import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundaryComponent from "~/components/error-boundary";
import { renderWithProviders } from "~/test-utils";

describe("ErrorBoundaryComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the error message", () => {
    renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Something went wrong")} />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("displays support message", () => {
    renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByText(/This error has been logged automatically/),
    ).toBeInTheDocument();
  });

  it("renders a reload button", () => {
    renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });

  it("calls router.invalidate when reload button is clicked", () => {
    const { router } = renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    const invalidateSpy = vi
      .spyOn(router, "invalidate")
      .mockResolvedValue(undefined as never);

    fireEvent.click(screen.getByRole("button", { name: "Reload page" }));

    expect(invalidateSpy).toHaveBeenCalledOnce();
  });

  it("mounts and renders without crashing with a real QueryClient", () => {
    renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });
});
