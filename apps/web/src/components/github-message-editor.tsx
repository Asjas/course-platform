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
    <div className="overflow-hidden rounded-md border border-gray-700">
      {/* Editor Header */}
      <div
        className="-mb-px flex justify-between border-b-[1px] border-gray-700 bg-gray-800 pt-2.5"
        style={{
          marginBottom: "calc(var(--borderWidth-thin) * -1)",
        }}
      >
        <div
          className=""
          style={{
            marginBottom: "calc(var(--borderWidth-thin) * -1)",
          }}
        >
          <button
            className={cn(
              "ml-2 flex-1 cursor-pointer px-4 py-2 text-sm font-medium",
              activeTab === "write"
                ? "rounded-t-md border-t border-r border-b-0 border-l border-gray-700 bg-gray-900 text-white"
                : "border-gray-700 bg-gray-800 text-gray-400",
            )}
            type="button"
            onClick={() => setActiveTab("write")}
          >
            Write
          </button>
          <button
            className={cn(
              "flex-1 cursor-pointer px-4 py-2 text-sm font-medium",
              activeTab === "preview"
                ? "rounded-t-md border-t border-r border-b-0 border-l border-gray-700 bg-gray-900 text-white"
                : "border-gray-700 bg-gray-800 text-gray-400",
            )}
            type="button"
            onClick={() => setActiveTab("preview")}
          >
            Preview
            {isPreviewLoading && <span className="ml-1">⟳</span>}
          </button>
        </div>
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
          {/* Comment Box */}
          <div className="bg-gray-900 p-2">
            <textarea
              className={cn(
                "block min-h-[180px] w-full resize-y rounded-sm bg-white p-4 text-sm text-gray-900",
                "focus:ring-1 focus:ring-green-500 focus:outline-none",
                "dark:bg-gray-900 dark:text-white",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "box-border border border-gray-600 leading-normal",
                "custom-scrollbar",
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
          </div>

          {/* Upload Button & Drag Hint */}
          <div className="absolute top-2 right-2"></div>
        </div>
      ) : (
        <div
          className={cn(
            "relative max-h-[800px] min-h-[196px] overflow-auto bg-gray-50 p-6 text-sm dark:bg-gray-900",
            "custom-scrollbar",
            activeTab !== "preview" && "hidden md:block md:opacity-50",
          )}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}

      {/* Markdown Help (GitHub-style) */}
      <div className="col-span-full flex justify-between gap-4 border-t border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white">
        <label className="relative inline-block w-full cursor-pointer hover:underline">
          {/* Hidden native file input */}
          <input
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            type="file"
            accept=".gif,.jpeg,.jpg,.mov,.mp4,.png,.gz,.log,.md,.txt,.yaml,.yml,.zip"
            multiple
            disabled={uploadingCount > 0}
            onChange={handleFileSelect}
          />

          {/* Custom button — looks like GitHub */}
          <span>
            {uploadingCount > 0
              ? `Uploading... (${uploadingCount})`
              : "Paste, drop, or click to add files."}
          </span>
        </label>
        <span>
          <a
            className="text-white hover:text-green-600"
            href="https://docs.github.com/en/get-started/writing-on-github/basic-writing-and-formatting-syntax"
          >
            <svg
              fill="currentColor"
              aria-hidden="true"
              height="18"
              viewBox="0 0 16 16"
              version="1.1"
              width="18"
            >
              <path d="M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z"></path>
            </svg>
          </a>
        </span>
      </div>
    </div>
  );
}
