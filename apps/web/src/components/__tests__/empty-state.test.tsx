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

  it("renders with centered content", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("justify-center");
  });

  it("renders with border styling", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("border", "rounded-lg");
  });

  it("renders with appropriate minimum height", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("min-h-100");
  });

  it("renders with top margin", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("mt-12");
  });

  it("renders inner content wrapper with text-center", () => {
    const { container } = render(<EmptyState title="No items" />);
    const innerDiv = container.querySelector(".text-center");
    expect(innerDiv).toBeInTheDocument();
  });

  it("title has correct text size and color", () => {
    render(<EmptyState title="No items" />);
    const title = screen.getByText("No items");
    expect(title).toHaveClass("text-lg");
  });

  it("description has smaller text than title", () => {
    render(
      <EmptyState
        title="No items"
        description="Try again"
      />,
    );
    const description = screen.getByText("Try again");
    expect(description).toHaveClass("text-sm");
  });

  it("description has top margin", () => {
    render(
      <EmptyState
        title="No items"
        description="Try again"
      />,
    );
    const description = screen.getByText("Try again");
    expect(description).toHaveClass("mt-2");
  });

  it("supports very long titles", () => {
    const longTitle = "A".repeat(100);
    render(<EmptyState title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it("supports very long descriptions", () => {
    const longDescription = "B".repeat(200);
    render(
      <EmptyState
        title="Title"
        description={longDescription}
      />,
    );
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it("custom className does not override base classes", () => {
    const { container } = render(
      <EmptyState
        className="custom"
        title="No items"
      />,
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("custom");
    expect(element).toHaveClass("flex");
    expect(element).toHaveClass("items-center");
  });

  it("renders with white background in light mode", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.firstChild).toHaveClass("bg-white");
  });

  it("has dark mode classes", () => {
    const { container } = render(<EmptyState title="No items" />);
    const element = container.firstChild as HTMLElement;
    expect(element?.className).toContain("dark:bg-gray-800");
  });
});
