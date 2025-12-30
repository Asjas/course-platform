import { useMutation } from "@tanstack/react-query";
import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  PlusCircleIcon,
  SmileIcon,
  TextQuoteIcon,
} from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { GiphyPicker } from "~/components/giphy-picker";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

interface GitHubMessageEditorProps {
  id: string;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  placeholder?: string;
  children: ReactNode;
  onSubmit?: () => void;
  hasError?: boolean;
}

export default function ChatMessageEditor({
  id,
  value,
  onChange,
  placeholder = "Write your message...",
  children,
  onSubmit,
  hasError = false,
}: GitHubMessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isGiphyPickerOpen, setIsGiphyPickerOpen] = useState(false);

  const signedUrlMutation = useMutation(
    trpc.images.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
  );

  function handleGifSelect(gifUrl: string) {
    const textarea = textareaRef.current;
    const cursorPos = textarea?.selectionStart ?? value.length;
    const gifMarkdown = `\n![GIF](${gifUrl})\n`;

    onChange(
      (prev) => prev.slice(0, cursorPos) + gifMarkdown + prev.slice(cursorPos),
    );

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const newPos = cursorPos + gifMarkdown.length;
      textarea.setSelectionRange(newPos, newPos);
    });

    toast.success("GIF added to message!");
  }

  const handleImageUpload = async (
    file: File,
    index: number,
    total: number,
  ) => {
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${crypto.randomUUID()}.${extension}`;
      const key = `support_ticket_attachments/${filename}`;

      const { presignedUrl, publicUrl } = await signedUrlMutation.mutateAsync({
        key,
        contentType: file.type,
      });

      if (!presignedUrl) throw new Error("Failed to generate upload URL");

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart ?? value.length;
      const alt = file.name.split(".").slice(0, -1).join(".") || "image";
      const imageMarkdown = `\n![${alt}](${publicUrl})\n`;

      onChange(
        (prev) =>
          prev.slice(0, cursorPos) + imageMarkdown + prev.slice(cursorPos),
      );

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
    <div className="overflow-hidden rounded-md border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      {/* Hidden file input */}
      <input
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        disabled={uploadingCount > 0}
      />

      <div
        className="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Comment Box */}
        <div className="bg-gray-100 p-2 dark:bg-gray-900">
          <textarea
            className={cn(
              "size-to-fit block min-h-5 w-full resize-y rounded-sm border bg-white px-2 py-2.5 text-sm text-gray-900",
              "focus:ring-1 focus:outline-none",
              "dark:bg-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "box-border leading-normal",
              "custom-scrollbar",
              uploadingCount > 0 && "opacity-75",
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
                : "border-gray-200 focus:border-green-500 focus:ring-green-500 dark:border-gray-700",
            )}
            id={id}
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey && onSubmit) {
                e.preventDefault();
                onSubmit();
              }
            }}
            spellCheck
            wrap="soft"
            disabled={uploadingCount > 0}
          />
        </div>
      </div>
      <div className="flex justify-between border-t border-gray-200 bg-gray-100 px-2 dark:border-gray-700 dark:bg-gray-800">
        <div
          className="mr-3 flex items-center text-xs text-gray-700 dark:text-gray-200"
          role="toolbar"
          aria-label="Formatting tools"
        >
          {/* Action Bar */}
          <button
            className="cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Upload attachment"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCount > 0}
          >
            <PlusCircleIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add header text"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const cursorPos = textarea.selectionStart;
              const headerMarkdown = "### ";

              onChange(
                (prev) =>
                  prev.slice(0, cursorPos) +
                  headerMarkdown +
                  prev.slice(cursorPos),
              );

              // Restore cursor
              requestAnimationFrame(() => {
                textarea.focus();
                const newPos = cursorPos + headerMarkdown.length;
                textarea.setSelectionRange(newPos, newPos);
              });
            }}
          >
            <HeadingIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add bold text"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Function to find the nearest ** markers around the cursor/selection
              const findBoldMarkers = () => {
                let startIndex = start;
                let endIndex = end;

                // Look backward for opening **
                while (
                  startIndex >= 2 &&
                  value.slice(startIndex - 2, startIndex) !== "**"
                ) {
                  startIndex--;
                }

                // Look forward for closing **
                while (
                  endIndex <= value.length - 2 &&
                  value.slice(endIndex, endIndex + 2) !== "**"
                ) {
                  endIndex++;
                }

                // Verify we found valid ** markers
                if (
                  startIndex >= 2 &&
                  value.slice(startIndex - 2, startIndex) === "**" &&
                  endIndex <= value.length - 2 &&
                  value.slice(endIndex, endIndex + 2) === "**"
                ) {
                  return {
                    isBold: true,
                    boldStart: startIndex - 2,
                    boldEnd: endIndex + 2,
                    innerText: value.slice(startIndex, endIndex),
                  };
                }

                return { isBold: false };
              };

              const { isBold, boldStart, boldEnd, innerText } =
                findBoldMarkers();

              if (isBold && boldStart !== undefined && boldEnd !== undefined) {
                // Remove bold markdown, keep the inner text
                onChange(
                  (prev) =>
                    prev.slice(0, boldStart) + innerText + prev.slice(boldEnd),
                );

                // Set cursor position after the inner text
                requestAnimationFrame(() => {
                  textarea.focus();
                  const newPos = boldStart + innerText.length;
                  textarea.setSelectionRange(newPos, newPos);
                });
              } else {
                // Add bold markdown
                const boldMarkdown = `**${selectedText}**`;
                onChange(
                  (prev) =>
                    prev.slice(0, start) + boldMarkdown + prev.slice(end),
                );

                // Place cursor after the first **
                requestAnimationFrame(() => {
                  textarea.focus();
                  const newPos = start + 2;
                  textarea.setSelectionRange(newPos, newPos);
                });
              }
            }}
          >
            <BoldIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add italic text"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Function to find the nearest _ markers around the cursor/selection
              const findItalicMarkers = () => {
                let startIndex = start;
                let endIndex = end;

                // Look backward for opening _
                while (startIndex >= 1 && value[startIndex - 1] !== "_") {
                  startIndex--;
                }

                // Look forward for closing _
                while (
                  endIndex <= value.length - 1 &&
                  value[endIndex] !== "_"
                ) {
                  endIndex++;
                }

                // Verify we found valid _ markers
                if (
                  startIndex >= 1 &&
                  value[startIndex - 1] === "_" &&
                  endIndex <= value.length - 1 &&
                  value[endIndex] === "_" &&
                  // Ensure the _ markers are not part of a larger markdown (e.g., __bold__)
                  (startIndex - 2 < 0 || value[startIndex - 2] !== "_") &&
                  (endIndex + 1 >= value.length || value[endIndex + 1] !== "_")
                ) {
                  return {
                    isItalic: true,
                    italicStart: startIndex - 1,
                    italicEnd: endIndex + 1,
                    innerText: value.slice(startIndex, endIndex),
                  };
                }

                return { isItalic: false };
              };

              const { isItalic, italicStart, italicEnd, innerText } =
                findItalicMarkers();

              if (
                isItalic &&
                italicStart !== undefined &&
                italicEnd !== undefined
              ) {
                // Remove italic markdown, keep the inner text
                onChange(
                  (prev) =>
                    prev.slice(0, italicStart) +
                    innerText +
                    prev.slice(italicEnd),
                );

                // Set cursor position after the inner text
                requestAnimationFrame(() => {
                  textarea.focus();
                  const newPos = italicStart + innerText.length;
                  textarea.setSelectionRange(newPos, newPos);
                });
              } else {
                // Add italic markdown
                const italicMarkdown = `_${selectedText}_`;
                onChange(
                  (prev) =>
                    prev.slice(0, start) + italicMarkdown + prev.slice(end),
                );

                // Place cursor after the first _
                requestAnimationFrame(() => {
                  textarea.focus();
                  const newPos = start + 1;
                  textarea.setSelectionRange(newPos, newPos);
                });
              }
            }}
          >
            <ItalicIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Insert a quote"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Helper: Check if cursor is at start of line
              const isAtStartOfLine = start === 0 || value[start - 1] === "\n";

              // Helper: Get the previous line (if any)
              const getPreviousLine = () => {
                if (start === 0) return null;
                const before = value.slice(0, start);
                const lines = before.split("\n");
                const prevLine = lines[lines.length - 1];
                return prevLine.trim() === "" ? null : prevLine; // ignore blank lines
              };

              const prevLine = getPreviousLine();

              if (selectedText) {
                // === CASE 1: Selected text → wrap in blockquote ===
                const quotedText = selectedText
                  .split("\n")
                  .map((line) => `> ${line}`)
                  .join("\n");

                const before = isAtStartOfLine ? "" : "\n";
                const after =
                  end < value.length && value[end] !== "\n" ? "\n\n" : "\n";

                const insertText = before + quotedText + after;

                onChange(
                  (prev) => prev.slice(0, start) + insertText + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(
                    start + insertText.length,
                    start + insertText.length,
                  );
                });
              } else {
                // === CASE 2: No selection → insert new blockquote ===
                let insertText = "> ";

                // If previous line is a blockquote, add blank line
                if (prevLine && prevLine.startsWith(">")) {
                  insertText = "\n\n> ";
                } else if (!isAtStartOfLine) {
                  insertText = "\n> ";
                }

                onChange(
                  (prev) => prev.slice(0, start) + insertText + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  const cursorPos = start + insertText.indexOf("> ") + 2;
                  textarea.setSelectionRange(cursorPos, cursorPos);
                });
              }
            }}
          >
            <TextQuoteIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add inline code"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Find nearest ` markers around the cursor/selection
              const findCodeMarkers = () => {
                let startIndex = start;
                let endIndex = end;

                // Look backward for opening `
                while (startIndex > 0 && value[startIndex - 1] !== "`") {
                  startIndex--;
                }

                // Look forward for closing `
                while (endIndex < value.length && value[endIndex] !== "`") {
                  endIndex++;
                }

                // Verify we found valid ` markers and they are not part of larger ```
                if (
                  startIndex > 0 &&
                  value[startIndex - 1] === "`" &&
                  endIndex < value.length &&
                  value[endIndex] === "`" &&
                  // Ensure not part of code block (```)
                  (startIndex - 2 < 0 ||
                    value.slice(startIndex - 2, startIndex) !== "``") &&
                  (endIndex + 1 >= value.length ||
                    value.slice(endIndex, endIndex + 2) !== "``")
                ) {
                  return {
                    isCode: true,
                    codeStart: startIndex - 1,
                    codeEnd: endIndex + 1,
                    innerText: value.slice(startIndex, endIndex),
                  };
                }

                return { isCode: false };
              };

              const { isCode, codeStart, codeEnd, innerText } =
                findCodeMarkers();

              if (isCode && codeStart !== undefined && codeEnd !== undefined) {
                // Remove code markdown
                onChange(
                  (prev) =>
                    prev.slice(0, codeStart) + innerText + prev.slice(codeEnd),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  const newPos = codeStart + innerText.length;
                  textarea.setSelectionRange(newPos, newPos);
                });
              } else {
                // Add code markdown
                const codeMarkdown = selectedText
                  ? `\`${selectedText}\``
                  : `\`\``;
                onChange(
                  (prev) =>
                    prev.slice(0, start) + codeMarkdown + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  const cursorPos = start + (selectedText ? 1 : 1);
                  textarea.setSelectionRange(
                    cursorPos,
                    cursorPos + (selectedText ? selectedText.length : 0),
                  );
                });
              }
            }}
          >
            <CodeIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add a link"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Find nearest [text](url) that fully contains the selection
              const findLink = () => {
                let openIdx = start;
                while (openIdx > 0 && value[openIdx - 1] !== "[") openIdx--;
                if (openIdx === 0 || value[openIdx - 1] !== "[") return null;

                const bracketClose = value.indexOf("]", openIdx);
                if (bracketClose === -1) return null;
                if (value[bracketClose + 1] !== "(") return null;

                const parenClose = value.indexOf(")", bracketClose + 2);
                if (parenClose === -1) return null;

                const innerText = value.slice(openIdx, bracketClose);
                const url = value.slice(bracketClose + 2, parenClose);

                const linkStart = openIdx - 1;
                const linkEnd = parenClose + 1;

                // Only consider it "default" if text is empty AND URL is exactly "url"
                const isDefault = innerText === "" && url === "url";

                // Only return if selection is fully inside
                if (start >= linkStart && end <= linkEnd && isDefault) {
                  return { linkStart, linkEnd, isDefault: true };
                }

                return null;
              };

              const link = findLink();

              // Only remove if it's the exact default `[](url)`
              if (link) {
                onChange(
                  (prev) =>
                    prev.slice(0, link.linkStart) + prev.slice(link.linkEnd),
                );
                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(link.linkStart, link.linkStart);
                });
                return;
              }

              // Otherwise: insert fresh link (even if inside a modified link)
              const markdown = selectedText
                ? `[${selectedText}](url)`
                : `[](url)`;
              onChange(
                (prev) => prev.slice(0, start) + markdown + prev.slice(end),
              );

              requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 1, start + 1); // cursor in []
              });
            }}
          >
            <LinkIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add a bulleted list"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selectedText = value.slice(start, end);

              // Helper: Check if cursor is at start of line
              const isAtStartOfLine = start === 0 || value[start - 1] === "\n";

              // Helper: Get the previous line (if any)
              const getPreviousLine = () => {
                if (start === 0) return null;
                const before = value.slice(0, start);
                const lines = before.split("\n");
                const prevLine = lines[lines.length - 1];
                return prevLine.trim() === "" ? null : prevLine; // ignore blank lines
              };

              const prevLine = getPreviousLine();

              if (selectedText) {
                // === CASE 1: Selected text → wrap in bulleted list ===
                const quotedText = selectedText
                  .split("\n")
                  .map((line) => `- ${line}`)
                  .join("\n");

                const before = isAtStartOfLine ? "" : "\n";
                const after =
                  end < value.length && value[end] !== "\n" ? "\n\n" : "\n";

                const insertText = before + quotedText + after;

                onChange(
                  (prev) => prev.slice(0, start) + insertText + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(
                    start + insertText.length,
                    start + insertText.length,
                  );
                });
              } else {
                // === CASE 2: No selection → insert new bullet ===
                let insertText = "- ";

                // If previous line is a bullet, add blank line
                if (prevLine && prevLine.startsWith("-")) {
                  insertText = "\n\n- ";
                } else if (!isAtStartOfLine) {
                  insertText = "\n- ";
                }

                onChange(
                  (prev) => prev.slice(0, start) + insertText + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  const cursorPos = start + insertText.indexOf("- ") + 2;
                  textarea.setSelectionRange(cursorPos, cursorPos);
                });
              }
            }}
          >
            <ListIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add a numbered list"
            onClick={() => {
              const textarea = textareaRef.current;
              if (!textarea) return;

              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const value = textarea.value;
              const selected = value.slice(start, end);

              // ---------- 1. Helper: line-range of the cursor ----------
              const lineStart = value.lastIndexOf("\n", start - 1) + 1;
              const lineEnd = value.indexOf("\n", start);
              const currentLine =
                lineEnd === -1
                  ? value.slice(lineStart)
                  : value.slice(lineStart, lineEnd);

              // ---------- 2. Detect if the current line is already a numbered item ----------
              const numberMatch = currentLine.match(/^\d+\.\s/);
              const isNumbered = !!numberMatch;

              // ---------- 3. Toggle logic ----------
              if (selected) {
                // ---- selection spans multiple lines → wrap each line ----
                const lines = selected.split("\n");
                const toggled = lines
                  .map((l, i) =>
                    l.match(/^\d+\.\s/)
                      ? l.replace(/^\d+\.\s/, "")
                      : `${i + 1}. ${l}`,
                  )
                  .join("\n");

                const before =
                  start === 0 || value[start - 1] === "\n" ? "" : "\n";
                const after =
                  end === value.length || value[end] === "\n" ? "" : "\n";

                const insert = before + toggled + after;

                onChange(
                  (prev) => prev.slice(0, start) + insert + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(
                    start + before.length,
                    start + before.length + toggled.length,
                  );
                });
              } else if (isNumbered) {
                // ---- cursor on a numbered item → remove it ----
                const removeStart = lineStart;
                const removeEnd = lineStart + numberMatch[0].length; // "1. "

                onChange(
                  (prev) =>
                    prev.slice(0, removeStart) +
                    prev.slice(removeEnd) +
                    prev.slice(lineEnd),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(removeStart, removeStart);
                });
              } else {
                // ---- no selection & not numbered → insert "1. " ----
                const insertText =
                  start === 0 || value[start - 1] === "\n" ? "1. " : "\n1. ";

                onChange(
                  (prev) => prev.slice(0, start) + insertText + prev.slice(end),
                );

                requestAnimationFrame(() => {
                  textarea.focus();
                  const cursor = start + insertText.length;
                  textarea.setSelectionRange(cursor, cursor);
                });
              }
            }}
          >
            <ListOrderedIcon
              size={16}
              aria-hidden="true"
            />
          </button>
          <button
            className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            type="button"
            aria-label="Add a GIF"
            onClick={() => setIsGiphyPickerOpen(true)}
          >
            <SmileIcon
              size={16}
              aria-hidden="true"
            />
          </button>
        </div>
        {children}
      </div>

      <GiphyPicker
        isOpen={isGiphyPickerOpen}
        onClose={() => setIsGiphyPickerOpen(false)}
        onSelectGif={handleGifSelect}
      />
    </div>
  );
}
