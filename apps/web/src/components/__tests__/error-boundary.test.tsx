import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundaryComponent from "~/components/error-boundary";
import { renderWithProviders } from "~/test-utils";

describe("ErrorBoundaryComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the error message", async () => {
    await renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Something went wrong")} />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("displays support message", async () => {
    await renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByText(/This error has been logged automatically/),
    ).toBeInTheDocument();
  });

  it("renders a reload button", async () => {
    await renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });

  it("calls router.invalidate when reload button is clicked", async () => {
    const { router } = await renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    const invalidateSpy = vi
      .spyOn(router, "invalidate")
      .mockResolvedValue(undefined as never);

    fireEvent.click(screen.getByRole("button", { name: "Reload page" }));

    expect(invalidateSpy).toHaveBeenCalledOnce();
  });

  it("mounts and renders without crashing with a real QueryClient", async () => {
    await renderWithProviders(
      <ErrorBoundaryComponent error={new Error("Test error")} />,
    );
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });
});
