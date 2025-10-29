import { useEffect, useState } from "react";
import { renderMarkdown } from "~/lib/markdown";
import { cn } from "~/lib/utils";

interface GitHubMessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function GitHubMessageEditor({
  value,
  onChange,
  placeholder = "Add your comment…",
}: GitHubMessageEditorProps) {
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

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 dark:border-gray-700">
      <div className="flex border-b border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <button
          className={cn(
            "flex-1 border-b-2 px-4 py-2 text-sm font-medium",
            activeTab === "write"
              ? "border-gray-500 bg-white text-white dark:bg-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
          )}
          type="button"
          onClick={() => setActiveTab("write")}
        >
          Write
        </button>
        <button
          className={cn(
            "flex-1 border-b-2 px-4 py-2 text-sm font-medium",
            activeTab === "preview"
              ? "border-gray-500 bg-white text-white dark:bg-gray-800"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400",
          )}
          type="button"
          onClick={() => setActiveTab("preview")}
        >
          Preview
          {isPreviewLoading && <span className="ml-1">⟳</span>}
        </button>
      </div>

      {activeTab === "write" ? (
        <div
          className={cn(
            "relative",
            activeTab !== "write" && "hidden md:block md:opacity-50",
          )}
        >
          <textarea
            className={cn(
              "h-[300px] w-full resize-none border-0 bg-white p-4 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
            )}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck
            wrap="soft"
          />
        </div>
      ) : (
        <div
          className={cn(
            "relative h-[300px] overflow-auto bg-gray-50 p-4 text-sm dark:bg-gray-900",
            activeTab !== "preview" && "hidden md:block md:opacity-50",
          )}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}

      {/* Markdown Help (GitHub-style) */}
      <div className="col-span-full border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <a
          className="font-medium hover:underline"
          href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
          target="_blank"
          rel="noopener noreferrer"
        >
          Styling with Markdown is supported
        </a>
      </div>
    </div>
  );
}
