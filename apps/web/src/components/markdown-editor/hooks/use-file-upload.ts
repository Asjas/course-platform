import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { generateAttachmentMarkdown, validateFile } from "~/lib/attachments";
import { trpc } from "~/lib/trpc.client";

interface UseFileUploadParams {
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

interface UseFileUploadResult {
  uploadingCount: number;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * Hook to manage file uploads with drag-and-drop and file picker
 */
export function useFileUpload({
  value,
  onChange,
  textareaRef,
}: UseFileUploadParams): UseFileUploadResult {
  const [uploadingCount, setUploadingCount] = useState(0);

  const signedUrlMutation = useMutation(
    trpc.images.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
  );

  async function handleFileUpload(file: File, index: number, total: number) {
    // Validate file type and size
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const extension = file.name.split(".").pop() || "bin";
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

      // Step 3: Insert Markdown based on file type
      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart ?? value.length;
      const attachmentMarkdown = generateAttachmentMarkdown(
        file.name,
        publicUrl,
      );
      const markdown = `\n${attachmentMarkdown}\n`;

      onChange(
        (prev) => prev.slice(0, cursorPos) + markdown + prev.slice(cursorPos),
      );

      // Restore cursor
      requestAnimationFrame(() => {
        if (!textarea) return;
        textarea.focus();
        const newPos = cursorPos + markdown.length;
        textarea.setSelectionRange(newPos, newPos);
      });

      toast.success(`File ${index + 1}/${total} uploaded!`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploadingCount(files.length);
    const toastId = toast.loading(`Uploading 0/${files.length}...`);

    for (let i = 0; i < files.length; i++) {
      toast.loading(`Uploading ${i + 1}/${files.length}...`, {
        id: toastId,
      });
      await handleFileUpload(files[i], i, files.length);
    }

    toast.success("All files uploaded!", { id: toastId });
    setUploadingCount(0);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingCount(files.length);
    const toastId = toast.loading(`Uploading 0/${files.length}...`);

    for (let i = 0; i < files.length; i++) {
      toast.loading(`Uploading ${i + 1}/${files.length}...`, {
        id: toastId,
      });
      await handleFileUpload(files[i], i, files.length);
    }

    toast.success("All files uploaded!", { id: toastId });
    setUploadingCount(0);
    e.target.value = "";
  }

  return {
    uploadingCount,
    handleDragOver,
    handleDrop,
    handleFileSelect,
  };
}
