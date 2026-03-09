import { describe, expect, it } from "vitest";
import {
  FILE_SIZE_LIMITS,
  formatFileSize,
  generateAttachmentMarkdown,
  getAcceptString,
  getAllowedExtensions,
  getFileCategory,
  getFileDisplayInfo,
  getFileExtension,
  getFileSizeLimit,
  getFileSizeLimitByMime,
  getFileTypeByExtension,
  getFileTypeByMime,
  getImageAcceptString,
  getSupportedExtensionsList,
  getSupportedFileTypesDescription,
  isImageFile,
  isVideoFile,
  isViewableFile,
  validateFile,
} from "~/lib/attachments";

describe("attachments utilities", () => {
  describe("getFileCategory", () => {
    it("returns correct category for known extensions", () => {
      expect(getFileCategory("test.jpg")).toBe("image");
      expect(getFileCategory("test.pdf")).toBe("document");
      expect(getFileCategory("test.zip")).toBe("archive");
      expect(getFileCategory("test.mp4")).toBe("video");
      expect(getFileCategory("test.txt")).toBe("text");
    });

    it("returns unknown for unsupported extensions", () => {
      expect(getFileCategory("test.xyz")).toBe("unknown");
      expect(getFileCategory("test.exe")).toBe("unknown");
    });
  });

  describe("getFileSizeLimit", () => {
    it("returns correct size limits for each file type", () => {
      expect(getFileSizeLimit("test.mp4")).toBe(FILE_SIZE_LIMITS.video);
      expect(getFileSizeLimit("test.jpg")).toBe(FILE_SIZE_LIMITS.image);
      expect(getFileSizeLimit("test.pdf")).toBe(FILE_SIZE_LIMITS.document);
      expect(getFileSizeLimit("test.zip")).toBe(FILE_SIZE_LIMITS.archive);
      expect(getFileSizeLimit("test.txt")).toBe(FILE_SIZE_LIMITS.text);
      expect(getFileSizeLimit("test.unknown")).toBe(FILE_SIZE_LIMITS.unknown);
    });
  });

  describe("validateFile", () => {
    it("accepts valid files within size limits", () => {
      const file = new File(["a".repeat(1024)], "test.jpg", {
        type: "image/jpeg",
      });
      const result = validateFile(file);
      expect(result).toBeNull();
    });

    it("rejects files with unsupported extensions", () => {
      const file = new File(["content"], "test.exe", {
        type: "application/x-msdownload",
      });
      const result = validateFile(file);
      expect(result).toBeTruthy();
      expect(result).toContain("not supported");
    });

    it("rejects files exceeding size limits", () => {
      const largeContent = "a".repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], "test.jpg", {
        type: "image/jpeg",
      });
      const result = validateFile(file);
      expect(result).toBeTruthy();
      expect(result).toContain("too large");
    });

    it("handles files without extensions", () => {
      const file = new File(["content"], "testfile", { type: "text/plain" });
      const result = validateFile(file);
      expect(result).toBeTruthy();
      expect(result).toContain("not supported");
    });

    it("validates different file categories correctly", () => {
      // PDF (document) - 10MB limit
      const pdfFile = new File(["a".repeat(9 * 1024 * 1024)], "test.pdf", {
        type: "application/pdf",
      });
      expect(validateFile(pdfFile)).toBeNull();

      // ZIP (archive) - 20MB limit
      const zipFile = new File(["a".repeat(19 * 1024 * 1024)], "test.zip", {
        type: "application/zip",
      });
      expect(validateFile(zipFile)).toBeNull();
    });
  });

  describe("getFileTypeByExtension", () => {
    it("returns config for known extensions", () => {
      const config = getFileTypeByExtension("jpg");
      expect(config).toBeDefined();
      expect(config?.category).toBe("image");
      expect(config?.isViewable).toBe(true);
    });

    it("returns undefined for unknown extensions", () => {
      const config = getFileTypeByExtension("xyz");
      expect(config).toBeUndefined();
    });
  });

  describe("getFileTypeByMime", () => {
    it("returns config for known mime types", () => {
      const config = getFileTypeByMime("image/jpeg");
      expect(config?.extension).toBe("jpg");
      expect(config?.category).toBe("image");
    });

    it("returns undefined for unknown mime types", () => {
      expect(getFileTypeByMime("application/unknown")).toBeUndefined();
    });
  });

  describe("getFileExtension", () => {
    it("extracts extension from URL pathname", () => {
      expect(getFileExtension("https://cdn.example.com/files/report.PDF")).toBe(
        "pdf",
      );
    });

    it("returns empty string when no extension exists", () => {
      expect(getFileExtension("https://example.com/files/readme")).toBe("");
    });
  });

  describe("isImageFile", () => {
    it("identifies image files correctly", () => {
      expect(isImageFile("test.jpg")).toBe(true);
      expect(isImageFile("test.png")).toBe(true);
      expect(isImageFile("test.gif")).toBe(true);
      expect(isImageFile("test.pdf")).toBe(false);
      expect(isImageFile("test.mp4")).toBe(false);
    });
  });

  describe("isVideoFile", () => {
    it("identifies video files correctly", () => {
      expect(isVideoFile("test.mp4")).toBe(true);
      expect(isVideoFile("test.webm")).toBe(true);
      expect(isVideoFile("test.jpg")).toBe(false);
      expect(isVideoFile("test.pdf")).toBe(false);
    });
  });

  describe("isViewableFile", () => {
    it("returns true for viewable files and false otherwise", () => {
      expect(isViewableFile("photo.png")).toBe(true);
      expect(isViewableFile("clip.mp4")).toBe(true);
      expect(isViewableFile("sheet.xlsx")).toBe(false);
    });
  });

  describe("getFileSizeLimitByMime", () => {
    it("returns category size limit when mime type is known", () => {
      expect(getFileSizeLimitByMime("video/mp4")).toBe(FILE_SIZE_LIMITS.video);
      expect(getFileSizeLimitByMime("text/plain")).toBe(FILE_SIZE_LIMITS.text);
    });

    it("returns unknown size limit when mime type is unknown", () => {
      expect(getFileSizeLimitByMime("application/x-random")).toBe(
        FILE_SIZE_LIMITS.unknown,
      );
    });
  });

  describe("formatFileSize", () => {
    it("formats file sizes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    });
  });

  describe("getAllowedExtensions", () => {
    it("returns array of allowed extensions", () => {
      const extensions = getAllowedExtensions();
      expect(extensions).toBeInstanceOf(Array);
      expect(extensions.length).toBeGreaterThan(0);
      expect(extensions).toContain(".jpg");
      expect(extensions).toContain(".pdf");
      expect(extensions).toContain(".mp4");
    });
  });

  describe("supported types helpers", () => {
    it("returns grouped description by category", () => {
      const description = getSupportedFileTypesDescription();
      expect(description).toContain("Images:");
      expect(description).toContain("Videos:");
      expect(description).toContain("Documents:");
      expect(description).toContain("Archives:");
      expect(description).toContain("Text:");
    });

    it("returns extensions list and accept strings", () => {
      const extensionsList = getSupportedExtensionsList();
      expect(extensionsList).toContain("jpg");
      expect(extensionsList).toContain("pdf");

      const acceptAll = getAcceptString();
      expect(acceptAll).toContain(".jpg");
      expect(acceptAll).toContain(".pdf");

      const imageAccept = getImageAcceptString();
      expect(imageAccept).toContain(".jpg");
      expect(imageAccept).not.toContain(".pdf");
    });
  });

  describe("display info and markdown generation", () => {
    it("returns known display info for supported file", () => {
      const info = getFileDisplayInfo("invoice.pdf");
      expect(info).toMatchObject({
        extension: "pdf",
        category: "document",
        isViewable: false,
      });
    });

    it("returns unknown display info for unsupported file", () => {
      const info = getFileDisplayInfo("mystery.bin");
      expect(info).toMatchObject({
        extension: "bin",
        category: "unknown",
        isViewable: false,
        icon: "File",
      });
    });

    it("generates markdown image syntax for viewable files", () => {
      const markdown = generateAttachmentMarkdown(
        "holiday.photo.png",
        "https://cdn.example.com/holiday.photo.png",
      );
      expect(markdown).toBe(
        "![holiday.photo](https://cdn.example.com/holiday.photo.png)",
      );
    });

    it("generates markdown link syntax for non-viewable files", () => {
      const markdown = generateAttachmentMarkdown(
        "report.pdf",
        "https://cdn.example.com/report.pdf",
      );
      expect(markdown).toBe(
        "[📎 report.pdf](https://cdn.example.com/report.pdf)",
      );
    });
  });
});
