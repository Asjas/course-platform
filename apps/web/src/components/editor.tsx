import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { renderMarkdown } from "~/lib/markdown";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

interface GitHubMessageEditorProps {
  id: string;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void; // ← FUNCTIONAL UPDATE
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [uploadingCount, setUploadingCount] = useState(0);

  const signedUrlMutation = useMutation(
    trpc.images.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
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

  const handleImageUpload = async (
    file: File,
    index: number,
    total: number,
  ) => {
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
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Step 3: Insert Markdown
      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart ?? value.length;
      const alt = file.name.split(".").slice(0, -1).join(".") || "image";
      const imageMarkdown = `\n![${alt}](${publicUrl})\n`;

      onChange(
        (prev) =>
          prev.slice(0, cursorPos) + imageMarkdown + prev.slice(cursorPos),
      );

      // Restore cursor
      requestAnimationFrame(() => {
        if (!textarea) return;
        textarea.focus();
        const newPos = cursorPos + imageMarkdown.length;
        textarea.setSelectionRange(newPos, newPos);
      });

      toast.success(`Image ${index + 1}/${total} uploaded!`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }

      // Only turn off uploading when ALL are done
      // We'll handle this in the loop
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploadingCount(imageFiles.length);
    const toastId = toast.loading(`Uploading 0/${imageFiles.length}...`);

    for (let i = 0; i < imageFiles.length; i++) {
      toast.loading(`Uploading ${i + 1}/${imageFiles.length}...`, {
        id: toastId,
      });
      await handleImageUpload(imageFiles[i], i, imageFiles.length);
    }

    toast.success("All images uploaded!", { id: toastId });
    setUploadingCount(0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploadingCount(imageFiles.length);
    const toastId = toast.loading(`Uploading 0/${imageFiles.length}...`);

    for (let i = 0; i < imageFiles.length; i++) {
      toast.loading(`Uploading ${i + 1}/${imageFiles.length}...`, {
        id: toastId,
      });
      await handleImageUpload(imageFiles[i], i, imageFiles.length);
    }

    toast.success("All images uploaded!", { id: toastId });
    setUploadingCount(0);
    e.target.value = "";
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
              uploadingCount > 0 && "opacity-75",
            )}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck
            wrap="soft"
            disabled={uploadingCount > 0}
          />

          {/* Upload Button & Drag Hint */}
          <div className="absolute top-2 right-2">
            <label className="relative inline-block cursor-pointer">
              {/* Hidden native file input */}
              <input
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingCount > 0}
                onChange={handleFileSelect}
              />

              {/* Custom button — looks like GitHub */}
              <span
                className={cn(
                  "inline-flex cursor-pointer items-center rounded px-3 py-1 text-xs font-medium text-white transition",
                  uploadingCount > 0
                    ? "cursor-not-allowed bg-gray-500"
                    : "bg-green-600 hover:bg-green-700",
                )}
              >
                {uploadingCount > 0
                  ? `Uploading... (${uploadingCount})`
                  : "Upload Images"}
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
