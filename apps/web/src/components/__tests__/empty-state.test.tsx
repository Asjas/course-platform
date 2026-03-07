import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "~/components/empty-state";

describe("EmptyState", () => {
  it("renders the title text", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <EmptyState
        title="No items"
        description="Try adjusting your filters"
      />,
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="No items" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState
        className="custom-class"
        title="No items"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("always renders with base styling classes", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("flex", "items-center");
  });
});
