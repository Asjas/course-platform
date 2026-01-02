import {
  DownloadIcon,
  FileArchiveIcon,
  FileCodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react";
import { formatFileSize, getFileDisplayInfo } from "~/lib/attachments";
import { cn } from "~/lib/utils";

interface FileAttachmentProps {
  /**
   * The URL of the file
   */
  url: string;
  /**
   * The filename (used for display and download)
   */
  filename: string;
  /**
   * Optional file size in bytes
   */
  fileSize?: number;
  /**
   * Optional CSS classes
   */
  className?: string;
}

interface FileIconProps {
  iconName: string;
  className?: string;
}

/**
 * Render the appropriate icon based on icon name.
 * Uses a switch statement to avoid creating components during render.
 */
function FileTypeIcon({ iconName, className }: FileIconProps) {
  switch (iconName) {
    case "Image":
      return (
        <ImageIcon
          className={className}
          aria-hidden="true"
        />
      );
    case "Video":
      return (
        <VideoIcon
          className={className}
          aria-hidden="true"
        />
      );
    case "FileText":
      return (
        <FileTextIcon
          className={className}
          aria-hidden="true"
        />
      );
    case "FileSpreadsheet":
      return (
        <FileSpreadsheetIcon
          className={className}
          aria-hidden="true"
        />
      );
    case "FileArchive":
      return (
        <FileArchiveIcon
          className={className}
          aria-hidden="true"
        />
      );
    case "FileCode":
      return (
        <FileCodeIcon
          className={className}
          aria-hidden="true"
        />
      );
    default:
      return (
        <FileIcon
          className={className}
          aria-hidden="true"
        />
      );
  }
}

/**
 * Component for rendering non-viewable file attachments with download button.
 *
 * This is used for PDFs, ZIPs, CSVs, and other files that can't be
 * embedded inline but need a clear download UI.
 */
export function FileAttachment({
  url,
  filename,
  fileSize,
  className,
}: FileAttachmentProps) {
  const info = getFileDisplayInfo(filename);

  // Handle download with proper filename
  function handleDownload(e: React.MouseEvent) {
    e.preventDefault();

    // Create a temporary link to trigger download with the correct filename
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // For cross-origin downloads, we need to fetch and create a blob
    // But for same-origin or if the server sets Content-Disposition, this works
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div
      className={cn(
        "dark:hover:bg-gray-750 my-2 inline-flex max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      {/* File icon */}
      <div className="shrink-0">
        <FileTypeIcon
          className="size-8 text-gray-500 dark:text-gray-400"
          iconName={info.icon}
        />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium text-gray-900 dark:text-white"
          title={filename}
        >
          {filename}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {info.label}
          {fileSize !== undefined && fileSize > 0 && (
            <span className="ml-1">• {formatFileSize(fileSize)}</span>
          )}
        </p>
      </div>

      {/* Download button */}
      <button
        className="shrink-0 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        type="button"
        onClick={handleDownload}
        aria-label={`Download ${filename}`}
        title={`Download ${filename}`}
      >
        <DownloadIcon
          className="size-5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/**
 * Inline link version for use within text content.
 * Renders as a styled link with file icon.
 */
export function FileAttachmentLink({
  url,
  filename,
  className,
}: Omit<FileAttachmentProps, "fileSize">) {
  const info = getFileDisplayInfo(filename);

  return (
    <a
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
        className,
      )}
      href={url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
    >
      <FileTypeIcon
        className="size-4"
        iconName={info.icon}
      />
      <span className="truncate">{filename}</span>
      <DownloadIcon
        className="size-3"
        aria-hidden="true"
      />
    </a>
  );
}

export default FileAttachment;
