import { useEffect, useState } from "react";
import { renderMarkdown } from "~/lib/markdown";

interface UseMarkdownPreviewResult {
  preview: string;
  isPreviewLoading: boolean;
}

/**
 * Hook to render markdown content with debouncing
 */
export function useMarkdownPreview(value: string): UseMarkdownPreviewResult {
  const [preview, setPreview] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setPreview("<p>Nothing to preview</p>");
      return;
    }

    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);

      try {
        const html = await renderMarkdown(value);
        setPreview(html);
      } catch (error) {
        console.error("Markdown render error:", error);
        setPreview("<p>Preview failed to render.</p>");
      } finally {
        setIsPreviewLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  return { preview, isPreviewLoading };
}
