import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MarkdownContent,
  SimpleMarkdownContent,
} from "~/components/markdown-content";

// createRoot is not fully supported in jsdom; provide no-op stubs
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

vi.mock("~/components/video-player", () => ({
  VideoPlayer: vi.fn(),
}));

describe("SimpleMarkdownContent", () => {
  it("renders text content from html", () => {
    render(<SimpleMarkdownContent html="<p>Hello World</p>" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders semantic html — heading, paragraph, and list are all accessible", () => {
    render(
      <SimpleMarkdownContent html="<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>" />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    // <li> elements have role listitem; query the text content directly
    expect(screen.getByText("Item")).toBeInTheDocument();
  });

  it("renders anchor links with the correct href", () => {
    render(
      <SimpleMarkdownContent html='<a href="https://example.com">Click here</a>' />,
    );
    expect(screen.getByRole("link", { name: "Click here" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("applies a custom className to the wrapper element", () => {
    const { container } = render(
      <SimpleMarkdownContent
        className="prose"
        html="<p>Test</p>"
      />,
    );
    expect(container.firstChild).toHaveClass("prose");
  });

  it("renders without crashing when html is an empty string", () => {
    const { container } = render(<SimpleMarkdownContent html="" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("MarkdownContent", () => {
  it("renders text content from html", () => {
    render(<MarkdownContent html="<p>Hello World</p>" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders semantic headings that are accessible by role", () => {
    render(<MarkdownContent html="<h2>Section Heading</h2>" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Section Heading" }),
    ).toBeInTheDocument();
  });

  it("applies a custom className to the wrapper element", () => {
    const { container } = render(
      <MarkdownContent
        className="prose prose-sm"
        html="<p>Test</p>"
      />,
    );
    expect(container.firstChild).toHaveClass("prose", "prose-sm");
  });

  it("renders without crashing when html is an empty string", () => {
    const { container } = render(<MarkdownContent html="" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders inline code elements", () => {
    render(<MarkdownContent html="<p>Use <code>const</code> keyword</p>" />);
    expect(screen.getByText("const")).toBeInTheDocument();
  });

  it("renders multiple paragraphs of content", () => {
    render(
      <MarkdownContent html="<p>First paragraph</p><p>Second paragraph</p>" />,
    );
    expect(screen.getByText("First paragraph")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
  });

  it("renders a table with rows and cells", () => {
    render(
      <MarkdownContent html="<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Alice</td></tr></tbody></table>" />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders nested list structure", () => {
    render(
      <MarkdownContent html="<ul><li>Item 1<ul><li>Sub-item</li></ul></li></ul>" />,
    );
    expect(screen.getByText("Sub-item")).toBeInTheDocument();
  });
});
