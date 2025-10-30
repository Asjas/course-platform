import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { renderMarkdown } from "~/lib/markdown";
import { trpc } from "~/lib/trpc.client.ts";
import { cn } from "~/lib/utils";

interface GitHubMessageEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function GitHubMessageEditor({
  id,
  value,
  onChange,
  placeholder = "Add your comment…",
}: GitHubMessageEditorProps) {
  const [preview, setPreview] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const signedUrlMutation = useMutation(
    trpc.profile.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
  );

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

  const insertImageMarkdown = useCallback(
    (publicUrl: string, alt: string, cursorPos: number) => {
      const imageMarkdown = `\n![${alt}](${publicUrl})\n`;
      const newValue =
        value.slice(0, cursorPos) + imageMarkdown + value.slice(cursorPos);

      // IMPORTANT: Call onChange **immediately** – this forces a re-render
      onChange(newValue);

      // Move cursor after the inserted markdown
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        const newPos = cursorPos + imageMarkdown.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [value, onChange],
  );

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${crypto.randomUUID()}.${extension}`;
      const key = `support_ticket_attachments/${filename}`;

      // Step 1: Get presigned URL
      const { presignedUrl, publicUrl } = await signedUrlMutation.mutateAsync({
        key,
        contentType: file.type,
      });

      if (!presignedUrl) throw new Error("Failed to generate upload URL");

      // Step 2: Upload to R2
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart ?? value.length;
      const alt = file.name.split(".").slice(0, -1).join(".") || "image";

      insertImageMarkdown(publicUrl, alt, cursorPos);

      toast.success("Image uploaded and embedded!");
    } catch (error) {
      console.error("Upload error:", error);

      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      handleImageUpload(imageFiles[0]); // Handle one at a time
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImageUpload(file);
      e.target.value = ""; // Reset for next upload
    }
  };

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
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <textarea
            className={cn(
              "block h-[300px] w-full resize-none bg-white p-4 text-sm text-gray-900",
              "focus:ring-1 focus:ring-indigo-500 focus:outline-none",
              "dark:bg-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "box-border leading-normal", // Critical
              isUploading && "opacity-75",
            )}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck
            wrap="soft"
            disabled={isUploading}
          />

          {/* Upload Button & Drag Hint */}
          <div className="absolute top-2 right-2">
            <label className="relative inline-block cursor-pointer">
              {/* Hidden native file input */}
              <input
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {/* Custom button — looks like GitHub */}
              <span
                className={cn(
                  "inline-flex items-center rounded px-3 py-1 text-xs font-medium text-white transition",
                  isUploading
                    ? "cursor-not-allowed bg-gray-500"
                    : "bg-green-600 hover:bg-green-700",
                )}
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </span>
            </label>
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400">
            Drag images here or click upload
          </div>
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
