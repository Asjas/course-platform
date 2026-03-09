import {
  getExtension,
  getFileLabel,
  getFilename,
  isVideoUrl,
  rehypeMediaEmbed,
} from "../rehype-media-embed";
import type { Element, Root, Text } from "hast";
import { describe, expect, test } from "vitest";

describe("getExtension", () => {
  test("extracts extension from full URL", () => {
    expect(getExtension("https://example.com/file.pdf")).toBe("pdf");
  });

  test("extracts extension from URL with query string", () => {
    expect(getExtension("https://example.com/file.png?v=123")).toBe("png");
  });

  test("extracts extension from URL with hash", () => {
    expect(getExtension("https://example.com/file.zip#section")).toBe("zip");
  });

  test("returns empty string for URL without extension", () => {
    expect(getExtension("https://example.com/file")).toBe("");
  });

  test("returns lowercase extension", () => {
    expect(getExtension("https://example.com/FILE.PDF")).toBe("pdf");
  });

  test("handles relative paths (non-URL)", () => {
    expect(getExtension("path/to/file.txt")).toBe("txt");
  });

  test("handles URL with multiple dots", () => {
    expect(getExtension("https://example.com/my.file.name.jpg")).toBe("jpg");
  });

  test("returns empty string for root URL", () => {
    expect(getExtension("https://example.com/")).toBe("");
  });

  test("extracts extension from encoded filename", () => {
    expect(getExtension("https://example.com/my%20notes.MD")).toBe("md");
  });

  test("uses pathname and ignores query-only extensions on valid URLs", () => {
    expect(getExtension("https://example.com/download?file=test.pdf")).toBe("");
  });

  test("returns empty string for filenames that end with a dot", () => {
    expect(getExtension("https://example.com/file.")).toBe("");
  });
});

describe("getFilename", () => {
  test("extracts filename from URL", () => {
    expect(getFilename("https://example.com/path/document.pdf")).toBe(
      "document.pdf",
    );
  });

  test("decodes URL-encoded filenames", () => {
    expect(getFilename("https://example.com/my%20file.txt")).toBe(
      "my file.txt",
    );
  });

  test("returns last segment for paths", () => {
    expect(getFilename("path/to/file.zip")).toBe("file.zip");
  });

  test("returns 'file' for root URL", () => {
    expect(getFilename("https://example.com/")).toBe("file");
  });

  test("handles URL with no path segments", () => {
    expect(getFilename("file.txt")).toBe("file.txt");
  });

  test("extracts filename while ignoring query and hash", () => {
    expect(getFilename("https://example.com/files/report.pdf?dl=1#top")).toBe(
      "report.pdf",
    );
  });

  test("decodes unicode URL-encoded filenames", () => {
    expect(getFilename("https://example.com/%E2%9C%93-checklist.txt")).toBe(
      "✓-checklist.txt",
    );
  });

  test("keeps query string for non-URL fallback values", () => {
    expect(getFilename("docs/manual.pdf?download=1")).toBe(
      "manual.pdf?download=1",
    );
  });
});

describe("isVideoUrl", () => {
  test("detects YouTube watch URL", () => {
    expect(isVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
  });

  test("detects YouTube short URL", () => {
    expect(isVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  test("detects YouTube embed URL", () => {
    expect(isVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  test("detects Vimeo URL", () => {
    expect(isVideoUrl("https://vimeo.com/123456789")).toBe(true);
  });

  test("returns false for non-video URLs", () => {
    expect(isVideoUrl("https://example.com")).toBe(false);
  });

  test("returns false for file URLs", () => {
    expect(isVideoUrl("https://example.com/video.mp4")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isVideoUrl("")).toBe(false);
  });

  test("detects short YouTube URL with query params", () => {
    expect(isVideoUrl("https://youtu.be/dQw4w9WgXcQ?t=43")).toBe(true);
  });

  test("returns false for incomplete YouTube watch URL", () => {
    expect(isVideoUrl("https://youtube.com/watch?v=")).toBe(false);
  });

  test("returns false for non-video Vimeo path", () => {
    expect(isVideoUrl("https://vimeo.com/channels/staffpicks")).toBe(false);
  });
});

describe("getFileLabel", () => {
  test("returns correct label for PDF", () => {
    expect(getFileLabel("pdf")).toBe("PDF Document");
  });

  test("returns correct label for zip", () => {
    expect(getFileLabel("zip")).toBe("ZIP Archive");
  });

  test("returns correct label for csv", () => {
    expect(getFileLabel("csv")).toBe("CSV File");
  });

  test("returns correct label for json", () => {
    expect(getFileLabel("json")).toBe("JSON File");
  });

  test("returns uppercase extension for unknown types", () => {
    expect(getFileLabel("xyz")).toBe("XYZ File");
  });

  test("returns expected label for yml extension", () => {
    expect(getFileLabel("yml")).toBe("YAML File");
  });
});

describe("rehypeMediaEmbed", () => {
  test("wraps gif image with gif-specific classes", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "img",
          properties: {
            src: "https://cdn.example.com/fun.gif",
            alt: "A gif",
          },
          children: [],
        },
      ],
    };

    rehypeMediaEmbed()(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe("div");
    expect(wrapper.properties?.className).toContain("media-embed-gif");
    const imageNode = wrapper.children[0] as Element;
    expect(imageNode.tagName).toBe("img");
    expect(imageNode.properties?.className).toContain("max-h-64");
  });

  test("converts mp4 image node into video element", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "img",
          properties: {
            src: "https://cdn.example.com/demo.mp4",
            alt: "Demo video",
          },
          children: [],
        },
      ],
    };

    rehypeMediaEmbed()(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe("div");
    expect(wrapper.properties?.className).toContain("media-embed-video");
    const videoNode = wrapper.children[0] as Element;
    expect(videoNode.tagName).toBe("video");
    expect(videoNode.properties?.src).toBe("https://cdn.example.com/demo.mp4");
  });

  test("converts youtube links into iframe embeds", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: {
            href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
          children: [{ type: "text", value: "watch" } as Text],
        },
      ],
    };

    rehypeMediaEmbed()(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe("div");
    const videoUrl = wrapper.properties?.["data-video-url"] as string;
    const embedUrl = wrapper.properties?.["data-embed-url"] as string;
    expect(videoUrl).toContain("youtube.com/watch");
    expect(embedUrl).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  test("converts downloadable links into attachment blocks", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: {
            href: "https://cdn.example.com/docs/guide.pdf",
          },
          children: [{ type: "text", value: "guide" } as Text],
        },
      ],
    };

    rehypeMediaEmbed()(tree);

    const attachment = tree.children[0] as Element;
    expect(attachment.tagName).toBe("div");
    expect(attachment.properties?.["data-file-ext"]).toBe("pdf");
    expect(attachment.properties?.["data-file-name"]).toBe("guide.pdf");
  });
});
