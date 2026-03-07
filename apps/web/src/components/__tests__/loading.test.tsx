import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "~/components/loading";

describe("Loading", () => {
  it("renders with status role for accessibility", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("includes screen reader text", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("has polite aria-live region", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("renders the spinner icon as decorative", () => {
    const { container } = render(<Loading />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
