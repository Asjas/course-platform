import type { Element, Root, Text } from "hast";
import { visit } from "unist-util-visit";

/**
 * File extensions that should be rendered as downloadable attachments
 * instead of inline images
 */
const DOWNLOADABLE_EXTENSIONS = new Set([
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  // Archives
  "zip",
  "tar",
  "gz",
  "rar",
  "7z",
  // Text/Code
  "txt",
  "md",
  "json",
  "yaml",
  "yml",
  "log",
]);

/**
 * Video extensions that can be embedded with HTML5 video
 */
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

/**
 * Get file extension from URL or filename
 */
function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([^./?#]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : "";
  } catch {
    const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : "";
  }
}

/**
 * Get filename from URL
 */
function getFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/");
    return decodeURIComponent(segments[segments.length - 1] || "file");
  } catch {
    const segments = url.split("/");
    return segments[segments.length - 1] || "file";
  }
}

/**
 * Rehype plugin to enhance media embeds:
 * - Wraps images in a container for better styling (with aspect-video for GIFs)
 * - Converts video file URLs to HTML5 video elements
 * - Converts downloadable file links to styled attachment blocks
 * - Detects YouTube/Vimeo URLs in links and converts to embeds
 * - Adds responsive video wrapper with aspect-video class
 */
export function rehypeMediaEmbed() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      // Handle images - wrap in a container with aspect-video for GIFs
      // Also handle video files that might be marked as "images" in markdown
      if (node.tagName === "img") {
        const src = node.properties?.src as string;
        const alt = node.properties?.alt as string;

        if (src) {
          const ext = getExtension(src);

          // Check if this is actually a video file
          if (VIDEO_EXTENSIONS.has(ext)) {
            const videoElement = createVideoElement(src, alt);
            if (videoElement && parent && typeof index === "number") {
              parent.children[index] = videoElement;
            }
            return;
          }

          // Check if it's a GIF
          const isGif =
            src.toLowerCase().includes(".gif") ||
            alt?.toLowerCase().includes("gif");

          // Add responsive image classes
          node.properties = {
            ...node.properties,
            className: isGif
              ? "max-w-full max-h-64 object-contain rounded-lg"
              : "max-w-full h-auto rounded-lg",
            loading: "lazy",
          };

          // Wrap in container
          const wrapper: Element = {
            type: "element",
            tagName: "div",
            properties: {
              className: isGif
                ? "media-embed-gif my-2 inline-block"
                : "media-embed-image my-4",
            },
            children: [node],
          };

          if (parent && typeof index === "number") {
            parent.children[index] = wrapper;
          }
        }
      }

      // Handle links - convert YouTube/Vimeo URLs to embeds
      // Or convert downloadable file links to attachment blocks
      if (node.tagName === "a") {
        const href = node.properties?.href as string;
        if (!href) return;

        // Check for video embed URLs (YouTube, Vimeo)
        if (isVideoUrl(href)) {
          const videoEmbed = createVideoEmbed(href);
          if (videoEmbed && parent && typeof index === "number") {
            parent.children[index] = videoEmbed;
          }
          return;
        }

        // Check for downloadable file attachments
        const ext = getExtension(href);
        if (DOWNLOADABLE_EXTENSIONS.has(ext)) {
          const filename = getFilename(href);
          const attachmentBlock = createFileAttachment(href, filename, ext);
          if (attachmentBlock && parent && typeof index === "number") {
            parent.children[index] = attachmentBlock;
          }
          return;
        }

        // Check for direct video file links
        if (VIDEO_EXTENSIONS.has(ext)) {
          const videoElement = createVideoElement(href);
          if (videoElement && parent && typeof index === "number") {
            parent.children[index] = videoElement;
          }
        }
      }
    });
  };
}

function isVideoUrl(url: string): boolean {
  const videoPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /vimeo\.com\/(\d+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];

  return videoPatterns.some((pattern) => pattern.test(url));
}

function createVideoEmbed(url: string): Element | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  let embedUrl = "";

  if (youtubeMatch) {
    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  } else if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  if (!embedUrl) return null;

  return {
    type: "element",
    tagName: "div",
    properties: {
      "className": "media-embed-video my-4",
      "data-video-url": url,
      "data-embed-url": embedUrl,
    },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: {
          className: "aspect-video",
        },
        children: [
          {
            type: "element",
            tagName: "iframe",
            properties: {
              src: embedUrl,
              className: "w-full h-full rounded-lg",
              frameBorder: "0",
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true,
            },
            children: [],
          },
        ],
      },
    ],
  };
}

/**
 * Create an HTML5 video element for direct video files
 */
function createVideoElement(src: string, alt?: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: "media-embed-video my-4",
    },
    children: [
      {
        type: "element",
        tagName: "video",
        properties: {
          src,
          className: "max-w-full rounded-lg",
          controls: true,
          preload: "metadata",
          title: alt || "Video attachment",
        },
        children: [
          {
            type: "text",
            value: "Your browser does not support the video tag.",
          } as Text,
        ],
      },
    ],
  };
}

/**
 * Get icon SVG for file type
 */
function getFileIcon(ext: string): string {
  const archiveExts = ["zip", "tar", "gz", "rar", "7z"];
  const docExts = ["pdf", "doc", "docx", "txt", "md"];
  const spreadsheetExts = ["xls", "xlsx", "csv"];
  const codeExts = ["json", "yaml", "yml", "log"];

  if (archiveExts.includes(ext)) {
    // Archive icon
    return `<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>`;
  }
  if (spreadsheetExts.includes(ext)) {
    // Spreadsheet icon
    return `<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>`;
  }
  if (codeExts.includes(ext)) {
    // Code icon
    return `<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`;
  }
  if (docExts.includes(ext)) {
    // Document icon
    return `<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
  }
  // Default file icon
  return `<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>`;
}

/**
 * Get human-readable label for file type
 */
function getFileLabel(ext: string): string {
  const labels: Record<string, string> = {
    "pdf": "PDF Document",
    "doc": "Word Document",
    "docx": "Word Document",
    "xls": "Excel Spreadsheet",
    "xlsx": "Excel Spreadsheet",
    "csv": "CSV File",
    "zip": "ZIP Archive",
    "tar": "TAR Archive",
    "gz": "GZIP Archive",
    "rar": "RAR Archive",
    "7z": "7-Zip Archive",
    "txt": "Text File",
    "md": "Markdown File",
    "json": "JSON File",
    "yaml": "YAML File",
    "yml": "YAML File",
    "log": "Log File",
  };
  return labels[ext] || `${ext.toUpperCase()} File`;
}

/**
 * Create a file attachment block for downloadable files
 */
function createFileAttachment(
  url: string,
  filename: string,
  ext: string,
): Element {
  const label = getFileLabel(ext);

  return {
    type: "element",
    tagName: "div",
    properties: {
      "className":
        "file-attachment my-2 inline-flex max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
      "data-file-url": url,
      "data-file-name": filename,
      "data-file-ext": ext,
    },
    children: [
      // File icon (using a span with SVG)
      {
        type: "element",
        tagName: "span",
        properties: {
          className: "text-gray-500 dark:text-gray-400",
        },
        children: [
          {
            type: "raw",
            value: getFileIcon(ext),
          } as unknown as Element,
        ],
      },
      // File info
      {
        type: "element",
        tagName: "div",
        properties: {
          className: "min-w-0 flex-1",
        },
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {
              className:
                "truncate text-sm font-medium text-gray-900 dark:text-white",
              title: filename,
            },
            children: [{ type: "text", value: filename } as Text],
          },
          {
            type: "element",
            tagName: "p",
            properties: {
              className: "text-xs text-gray-500 dark:text-gray-400",
            },
            children: [{ type: "text", value: label } as Text],
          },
        ],
      },
      // Download link
      {
        type: "element",
        tagName: "a",
        properties: {
          href: url,
          download: filename,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "flex-shrink-0 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
          title: `Download ${filename}`,
        },
        children: [
          {
            type: "raw",
            value: `<svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>`,
          } as unknown as Element,
        ],
      },
    ],
  };
}
