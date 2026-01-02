import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { VideoPlayer } from "~/components/video-player";
import { cn } from "~/lib/utils";

interface MarkdownContentProps {
  /**
   * The HTML content from markdown rendering
   */
  html: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Component that renders markdown HTML content and enhances video elements
 * with the VideoPlayer component for consistent styling and functionality.
 *
 * This allows us to use our react-player based VideoPlayer for videos
 * embedded in chat messages and support tickets, ensuring consistent
 * styling across the application.
 */
export function MarkdownContent({ html, className }: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<Map<Element, ReturnType<typeof createRoot>>>(
    new Map(),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Capture current roots map for cleanup
    const currentRoots = rootsRef.current;

    // Find all video elements and replace them with VideoPlayer
    const videoElements = container.querySelectorAll("video");

    for (const video of videoElements) {
      const src = video.getAttribute("src");
      if (!src) continue;

      // Create a wrapper div for the React component
      const wrapper = document.createElement("div");
      wrapper.className = "video-player-wrapper my-4";

      // Replace the video element with the wrapper
      video.parentNode?.replaceChild(wrapper, video);

      // Create a React root and render the VideoPlayer
      const root = createRoot(wrapper);
      currentRoots.set(wrapper, root);

      root.render(
        <VideoPlayer
          className="max-w-md rounded-lg"
          url={src}
          controls
        />,
      );
    }

    // Also handle video wrappers that might have been created by rehype-media-embed
    const videoWrappers = container.querySelectorAll(
      ".media-embed-video[data-video-url]",
    );

    for (const wrapper of videoWrappers) {
      const videoUrl = wrapper.getAttribute("data-video-url");
      if (!videoUrl) continue;

      // Check if this is an iframe (YouTube/Vimeo) - leave those as is
      const iframe = wrapper.querySelector("iframe");
      if (iframe) continue;

      // Clear the wrapper content
      wrapper.innerHTML = "";
      wrapper.className = "video-player-wrapper my-4";

      // Create a React root and render the VideoPlayer
      const root = createRoot(wrapper);
      currentRoots.set(wrapper, root);

      root.render(
        <VideoPlayer
          className="max-w-md rounded-lg"
          url={videoUrl}
          controls
        />,
      );
    }

    // Cleanup function - use captured reference
    return () => {
      for (const [element, root] of currentRoots) {
        root.unmount();
        currentRoots.delete(element);
      }
    };
  }, [html]);

  return (
    <div
      className={cn(className)}
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Simpler version that just renders HTML without video enhancement.
 * Use this when you don't need video player functionality.
 */
export function SimpleMarkdownContent({
  html,
  className,
}: MarkdownContentProps) {
  return (
    <div
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
