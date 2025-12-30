import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to enhance media embeds:
 * - Wraps images in a container for better styling (with aspect-video for GIFs)
 * - Detects YouTube/Vimeo URLs in links and converts to embeds
 * - Adds responsive video wrapper with aspect-video class
 */
export function rehypeMediaEmbed() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      // Handle images - wrap in a container with aspect-video for GIFs
      if (node.tagName === "img") {
        const src = node.properties?.src as string;
        const alt = node.properties?.alt as string;

        if (src) {
          // Check if it's a GIF
          const isGif =
            src.toLowerCase().includes(".gif") ||
            alt?.toLowerCase().includes("gif");

          // Add responsive image classes
          node.properties = {
            ...node.properties,
            className: isGif
              ? "w-full h-full object-contain"
              : "max-w-full h-auto rounded-lg",
            loading: "lazy",
          };

          // Wrap in container - use aspect-video for GIFs
          const wrapper: Element = {
            type: "element",
            tagName: "div",
            properties: {
              className: isGif
                ? "media-embed-gif aspect-video my-4"
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
      if (node.tagName === "a") {
        const href = node.properties?.href as string;
        if (href && isVideoUrl(href)) {
          const videoEmbed = createVideoEmbed(href);
          if (videoEmbed && parent && typeof index === "number") {
            parent.children[index] = videoEmbed;
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
