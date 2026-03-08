import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FileAttachment,
  FileAttachmentLink,
} from "~/components/file-attachment";

vi.mock("~/lib/attachments", () => ({
  formatFileSize: (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  },
  getFileDisplayInfo: (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return { icon: "FileText", label: "PDF Document" };
      case "zip":
        return { icon: "FileArchive", label: "ZIP Archive" };
      case "png":
      case "jpg":
        return { icon: "Image", label: "Image" };
      default:
        return { icon: "File", label: "File" };
    }
  },
}));

describe("FileAttachment", () => {
  it("renders the filename", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
  });

  it("renders the file type label", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    expect(screen.getByText("PDF Document")).toBeInTheDocument();
  });

  it("renders file size when provided", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
        fileSize={2048}
      />,
    );
    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
  });

  it("does not render file size when zero", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
        fileSize={0}
      />,
    );
    expect(screen.queryByText(/\d+.*B/)).not.toBeInTheDocument();
  });

  it("renders a download button with accessible label", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    const button = screen.getByRole("button", {
      name: /download doc\.pdf/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("the download button has a proper accessible name that includes the filename", () => {
    render(
      <FileAttachment
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    expect(
      screen.getByRole("button", { name: /download doc\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FileAttachment
        className="custom-class"
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("FileAttachmentLink", () => {
  it("renders a link with the filename", () => {
    render(
      <FileAttachmentLink
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/files/doc.pdf");
    expect(link).toHaveAttribute("download", "doc.pdf");
  });

  it("opens in new tab with security attributes", () => {
    render(
      <FileAttachmentLink
        url="/files/doc.pdf"
        filename="doc.pdf"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
