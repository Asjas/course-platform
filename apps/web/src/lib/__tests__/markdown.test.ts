import { describe, expect, it } from "vitest";
import { renderMarkdown } from "~/lib/markdown";

describe("renderMarkdown", () => {
  it("returns fallback for undefined input", async () => {
    const result = await renderMarkdown(undefined);
    expect(result).toBe("<p>Nothing to preview</p>");
  });

  it("returns fallback for empty string", async () => {
    const result = await renderMarkdown("");
    expect(result).toBe("<p>Nothing to preview</p>");
  });

  it("renders basic paragraph text", async () => {
    const result = await renderMarkdown("Hello world");
    expect(result).toContain("<p>");
    expect(result).toContain("Hello world");
  });

  it("renders headings", async () => {
    const result = await renderMarkdown("# My Heading");
    expect(result).toContain("<h1>");
    expect(result).toContain("My Heading");
  });

  it("renders bold text", async () => {
    const result = await renderMarkdown("**bold text**");
    expect(result).toContain("<strong>");
    expect(result).toContain("bold text");
  });

  it("renders italic text", async () => {
    const result = await renderMarkdown("*italic text*");
    expect(result).toContain("<em>");
    expect(result).toContain("italic text");
  });

  it("renders links", async () => {
    const result = await renderMarkdown("[Example](https://example.com)");
    expect(result).toContain("<a");
    expect(result).toContain("https://example.com");
    expect(result).toContain("Example");
  });

  it("adds nofollow to external links", async () => {
    const result = await renderMarkdown("[Example](https://example.com)");
    expect(result).toContain("nofollow");
  });

  it("renders unordered lists", async () => {
    const result = await renderMarkdown("- item 1\n- item 2");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
    expect(result).toContain("item 1");
    expect(result).toContain("item 2");
  });

  it("renders code blocks", async () => {
    const result = await renderMarkdown("```\nconst x = 1;\n```");
    expect(result).toContain("<code>");
    expect(result).toContain("const x = 1;");
  });

  it("renders inline code", async () => {
    const result = await renderMarkdown("Use `const` for variables");
    expect(result).toContain("<code>");
    expect(result).toContain("const");
  });

  it("renders GFM tables", async () => {
    const md = "| Col1 | Col2 |\n| --- | --- |\n| A | B |";
    const result = await renderMarkdown(md);
    expect(result).toContain("<table>");
    expect(result).toContain("<th>");
    expect(result).toContain("Col1");
  });

  it("renders GFM strikethrough", async () => {
    const result = await renderMarkdown("~~deleted~~");
    expect(result).toContain("<del>");
    expect(result).toContain("deleted");
  });

  it("sanitizes dangerous HTML", async () => {
    const result = await renderMarkdown('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
  });

  it("sanitizes event handlers", async () => {
    const result = await renderMarkdown('<img src="x" onerror="alert(1)" />');
    expect(result).not.toContain("onerror");
  });
});
