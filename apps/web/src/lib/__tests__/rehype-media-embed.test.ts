import {
  getExtension,
  getFileLabel,
  getFilename,
  isVideoUrl,
} from "../rehype-media-embed";
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
});
