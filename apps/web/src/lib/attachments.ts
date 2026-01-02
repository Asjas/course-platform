/**
 * Attachment configuration and utilities for file uploads.
 *
 * This module defines:
 * - Allowed file types and their MIME types
 * - File size limits per category
 * - Utilities for file validation and type detection
 */

// =============================================================================
// FILE CATEGORIES
// =============================================================================

/**
 * File categories for grouping file types
 */
export type FileCategory =
  | "image"
  | "video"
  | "document"
  | "archive"
  | "text"
  | "unknown";

/**
 * Configuration for a file type
 */
export interface FileTypeConfig {
  /** File extension (without dot) */
  extension: string;
  /** MIME type(s) for this file type */
  mimeTypes: string[];
  /** Category for grouping */
  category: FileCategory;
  /** Whether the file can be embedded/previewed inline */
  isViewable: boolean;
  /** Human-readable label */
  label: string;
  /** Icon name from lucide-react */
  icon: string;
}

// =============================================================================
// FILE SIZE LIMITS (in bytes)
// =============================================================================

export const FILE_SIZE_LIMITS = {
  /** Video files: 100MB max */
  video: 100 * 1024 * 1024,
  /** Archive files (zip, tar.gz, etc.): 20MB max */
  archive: 20 * 1024 * 1024,
  /** Image files: 10MB max */
  image: 10 * 1024 * 1024,
  /** Document files (PDF, etc.): 10MB max */
  document: 10 * 1024 * 1024,
  /** Text files: 5MB max */
  text: 5 * 1024 * 1024,
  /** Unknown/other files: 5MB max */
  unknown: 5 * 1024 * 1024,
} as const;

// =============================================================================
// SUPPORTED FILE TYPES
// =============================================================================

export const SUPPORTED_FILE_TYPES: FileTypeConfig[] = [
  // Images (viewable inline)
  {
    extension: "jpg",
    mimeTypes: ["image/jpeg"],
    category: "image",
    isViewable: true,
    label: "JPEG Image",
    icon: "Image",
  },
  {
    extension: "jpeg",
    mimeTypes: ["image/jpeg"],
    category: "image",
    isViewable: true,
    label: "JPEG Image",
    icon: "Image",
  },
  {
    extension: "png",
    mimeTypes: ["image/png"],
    category: "image",
    isViewable: true,
    label: "PNG Image",
    icon: "Image",
  },
  {
    extension: "gif",
    mimeTypes: ["image/gif"],
    category: "image",
    isViewable: true,
    label: "GIF Image",
    icon: "Image",
  },
  {
    extension: "webp",
    mimeTypes: ["image/webp"],
    category: "image",
    isViewable: true,
    label: "WebP Image",
    icon: "Image",
  },
  {
    extension: "svg",
    mimeTypes: ["image/svg+xml"],
    category: "image",
    isViewable: true,
    label: "SVG Image",
    icon: "Image",
  },

  // Videos (viewable inline, but with size limit)
  {
    extension: "mp4",
    mimeTypes: ["video/mp4"],
    category: "video",
    isViewable: true,
    label: "MP4 Video",
    icon: "Video",
  },
  {
    extension: "webm",
    mimeTypes: ["video/webm"],
    category: "video",
    isViewable: true,
    label: "WebM Video",
    icon: "Video",
  },
  {
    extension: "mov",
    mimeTypes: ["video/quicktime"],
    category: "video",
    isViewable: true,
    label: "QuickTime Video",
    icon: "Video",
  },

  // Documents (downloadable, not viewable inline)
  {
    extension: "pdf",
    mimeTypes: ["application/pdf"],
    category: "document",
    isViewable: false,
    label: "PDF Document",
    icon: "FileText",
  },
  {
    extension: "doc",
    mimeTypes: ["application/msword"],
    category: "document",
    isViewable: false,
    label: "Word Document",
    icon: "FileText",
  },
  {
    extension: "docx",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    category: "document",
    isViewable: false,
    label: "Word Document",
    icon: "FileText",
  },
  {
    extension: "xls",
    mimeTypes: ["application/vnd.ms-excel"],
    category: "document",
    isViewable: false,
    label: "Excel Spreadsheet",
    icon: "FileSpreadsheet",
  },
  {
    extension: "xlsx",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    category: "document",
    isViewable: false,
    label: "Excel Spreadsheet",
    icon: "FileSpreadsheet",
  },
  {
    extension: "csv",
    mimeTypes: ["text/csv", "application/csv"],
    category: "document",
    isViewable: false,
    label: "CSV File",
    icon: "FileSpreadsheet",
  },

  // Archives (downloadable)
  {
    extension: "zip",
    mimeTypes: ["application/zip", "application/x-zip-compressed"],
    category: "archive",
    isViewable: false,
    label: "ZIP Archive",
    icon: "FileArchive",
  },
  {
    extension: "tar",
    mimeTypes: ["application/x-tar"],
    category: "archive",
    isViewable: false,
    label: "TAR Archive",
    icon: "FileArchive",
  },
  {
    extension: "gz",
    mimeTypes: ["application/gzip", "application/x-gzip"],
    category: "archive",
    isViewable: false,
    label: "GZIP Archive",
    icon: "FileArchive",
  },
  {
    extension: "rar",
    mimeTypes: ["application/vnd.rar", "application/x-rar-compressed"],
    category: "archive",
    isViewable: false,
    label: "RAR Archive",
    icon: "FileArchive",
  },
  {
    extension: "7z",
    mimeTypes: ["application/x-7z-compressed"],
    category: "archive",
    isViewable: false,
    label: "7-Zip Archive",
    icon: "FileArchive",
  },

  // Text files (downloadable, could potentially be viewable in a code block)
  {
    extension: "txt",
    mimeTypes: ["text/plain"],
    category: "text",
    isViewable: false,
    label: "Text File",
    icon: "FileText",
  },
  {
    extension: "md",
    mimeTypes: ["text/markdown"],
    category: "text",
    isViewable: false,
    label: "Markdown File",
    icon: "FileText",
  },
  {
    extension: "json",
    mimeTypes: ["application/json"],
    category: "text",
    isViewable: false,
    label: "JSON File",
    icon: "FileCode",
  },
  {
    extension: "yaml",
    mimeTypes: ["application/x-yaml", "text/yaml"],
    category: "text",
    isViewable: false,
    label: "YAML File",
    icon: "FileCode",
  },
  {
    extension: "yml",
    mimeTypes: ["application/x-yaml", "text/yaml"],
    category: "text",
    isViewable: false,
    label: "YAML File",
    icon: "FileCode",
  },
  {
    extension: "log",
    mimeTypes: ["text/plain"],
    category: "text",
    isViewable: false,
    label: "Log File",
    icon: "FileText",
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get file type configuration by extension
 */
export function getFileTypeByExtension(
  extension: string,
): FileTypeConfig | undefined {
  const ext = extension.toLowerCase().replace(/^\./, "");
  return SUPPORTED_FILE_TYPES.find((ft) => ft.extension === ext);
}

/**
 * Get file type configuration by MIME type
 */
export function getFileTypeByMime(
  mimeType: string,
): FileTypeConfig | undefined {
  return SUPPORTED_FILE_TYPES.find((ft) => ft.mimeTypes.includes(mimeType));
}

/**
 * Get the file extension from a filename or URL
 */
export function getFileExtension(filenameOrUrl: string): string {
  // Handle URLs - extract path first
  let filename = filenameOrUrl;
  try {
    const url = new URL(filenameOrUrl);
    filename = url.pathname;
  } catch {
    // Not a URL, treat as filename
  }

  // Extract extension
  const match = filename.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Get file category from filename/URL
 */
export function getFileCategory(filenameOrUrl: string): FileCategory {
  const ext = getFileExtension(filenameOrUrl);
  const config = getFileTypeByExtension(ext);
  return config?.category ?? "unknown";
}

/**
 * Check if a file is viewable inline (images, videos)
 */
export function isViewableFile(filenameOrUrl: string): boolean {
  const ext = getFileExtension(filenameOrUrl);
  const config = getFileTypeByExtension(ext);
  return config?.isViewable ?? false;
}

/**
 * Check if a file is an image
 */
export function isImageFile(filenameOrUrl: string): boolean {
  return getFileCategory(filenameOrUrl) === "image";
}

/**
 * Check if a file is a video
 */
export function isVideoFile(filenameOrUrl: string): boolean {
  return getFileCategory(filenameOrUrl) === "video";
}

/**
 * Get the size limit for a file based on its category
 */
export function getFileSizeLimit(filenameOrUrl: string): number {
  const category = getFileCategory(filenameOrUrl);
  return FILE_SIZE_LIMITS[category];
}

/**
 * Get the size limit for a file by its MIME type
 */
export function getFileSizeLimitByMime(mimeType: string): number {
  const config = getFileTypeByMime(mimeType);
  if (!config) return FILE_SIZE_LIMITS.unknown;
  return FILE_SIZE_LIMITS[config.category];
}

/**
 * Validate a file for upload
 * Returns null if valid, or an error message if invalid
 */
export function validateFile(file: File): string | null {
  const ext = getFileExtension(file.name);
  const config = getFileTypeByExtension(ext);

  // Check if file type is supported
  if (!config) {
    return `File type ".${ext}" is not supported. Supported types: ${getAllowedExtensions().join(", ")}`;
  }

  // Check file size
  const sizeLimit = FILE_SIZE_LIMITS[config.category];
  if (file.size > sizeLimit) {
    const limitMB = Math.round(sizeLimit / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File "${file.name}" is too large (${fileSizeMB}MB). Maximum size for ${config.category} files is ${limitMB}MB.`;
  }

  return null;
}

/**
 * Get all allowed file extensions
 */
export function getAllowedExtensions(): string[] {
  return [...new Set(SUPPORTED_FILE_TYPES.map((ft) => `.${ft.extension}`))];
}

/**
 * Get accept string for file input (all supported types)
 */
export function getAcceptString(): string {
  return getAllowedExtensions().join(",");
}

/**
 * Get accept string for images only
 */
export function getImageAcceptString(): string {
  return SUPPORTED_FILE_TYPES.filter((ft) => ft.category === "image")
    .map((ft) => `.${ft.extension}`)
    .join(",");
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get file info for display (icon, label, etc.)
 */
export interface FileDisplayInfo {
  extension: string;
  category: FileCategory;
  isViewable: boolean;
  label: string;
  icon: string;
}

export function getFileDisplayInfo(filenameOrUrl: string): FileDisplayInfo {
  const ext = getFileExtension(filenameOrUrl);
  const config = getFileTypeByExtension(ext);

  if (config) {
    return {
      extension: ext,
      category: config.category,
      isViewable: config.isViewable,
      label: config.label,
      icon: config.icon,
    };
  }

  return {
    extension: ext || "unknown",
    category: "unknown",
    isViewable: false,
    label: ext ? `${ext.toUpperCase()} File` : "Unknown File",
    icon: "File",
  };
}

/**
 * Generate the appropriate markdown for a file attachment
 *
 * - Images/Videos: `![alt](url)` - will be rendered inline
 * - Other files: `[📎 filename](url)` - will be rendered as download link
 */
export function generateAttachmentMarkdown(
  filename: string,
  url: string,
): string {
  const info = getFileDisplayInfo(filename);

  if (info.isViewable) {
    // Images and videos - use standard markdown image syntax
    const alt = filename.split(".").slice(0, -1).join(".") || filename;
    return `![${alt}](${url})`;
  }

  // Non-viewable files - use link syntax with file emoji
  return `[📎 ${filename}](${url})`;
}
