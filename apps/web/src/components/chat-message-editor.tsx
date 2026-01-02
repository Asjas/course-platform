import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@packages/shared-ui/components/tooltip";
import { useMutation } from "@tanstack/react-query";
import {
  AtSignIcon,
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
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { GiphyPicker } from "~/components/giphy-picker";
import {
  type MentionContext,
  MentionPicker,
} from "~/components/mention-picker";
import {
  generateAttachmentMarkdown,
  getAcceptString,
  getSupportedFileTypesDescription,
  validateFile,
} from "~/lib/attachments";
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
  /**
   * Context for the mention picker (determines which users can be mentioned)
   */
  mentionContext?: MentionContext;
  /**
   * Size of toolbar icons in pixels (default: 16)
   */
  iconSize?: number;
  /**
   * Padding class for toolbar buttons (default: "p-2")
   */
  buttonPadding?: string;
}

export default function ChatMessageEditor({
  id,
  value,
  onChange,
  placeholder = "Write your message...",
  children,
  onSubmit,
  hasError = false,
  mentionContext,
  iconSize = 16,
  buttonPadding = "p-2",
}: GitHubMessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isGiphyPickerOpen, setIsGiphyPickerOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isMentionPickerOpen, setIsMentionPickerOpen] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  const signedUrlMutation = useMutation(
    trpc.images.getPresignedUrl.mutationOptions({ keyPrefix: undefined }),
  );

  // Auto-resize textarea like Slack - grows with content, pushes chat up
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height - clamp between min (40px) and max (50% of viewport)
    const minHeight = 40;
    const maxHeight = Math.min(window.innerHeight * 0.5, 300);
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );

    textarea.style.height = `${newHeight}px`;

    // Only show scrollbar when content exceeds max height
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  // Adjust height whenever value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  // Also adjust on window resize
  useEffect(() => {
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, [adjustTextareaHeight]);

  // Detect @ mention trigger
  useEffect(() => {
    if (!mentionContext) return;

    // Find the @ symbol before the cursor
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
      setIsMentionPickerOpen(false);
      setMentionSearchQuery("");
      setMentionStartIndex(-1);
      return;
    }

    // Check if there's a space between @ and cursor (which means mention is complete)
    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
    const hasSpace = textAfterAt.includes(" ");

    if (hasSpace) {
      setIsMentionPickerOpen(false);
      setMentionSearchQuery("");
      setMentionStartIndex(-1);
      return;
    }

    // Check if @ is at start of text or preceded by whitespace
    const charBeforeAt = value[lastAtIndex - 1];
    const isValidStart =
      lastAtIndex === 0 ||
      charBeforeAt === " " ||
      charBeforeAt === "\n" ||
      charBeforeAt === undefined;

    if (!isValidStart) {
      setIsMentionPickerOpen(false);
      setMentionSearchQuery("");
      setMentionStartIndex(-1);
      return;
    }

    // Valid mention trigger
    setIsMentionPickerOpen(true);
    setMentionSearchQuery(textAfterAt);
    setMentionStartIndex(lastAtIndex);
  }, [value, cursorPosition, mentionContext]);

  function handleMentionSelect(user: {
    name: string;
    username: string | null;
    displayUsername: string | null;
  }) {
    if (mentionStartIndex === -1) return;

    // Replace @query with @username
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterCursor = value.slice(cursorPosition);
    const username = user.displayUsername || user.username || user.name;
    const newValue = `${beforeMention}@${username} ${afterCursor}`;

    onChange(newValue);
    setIsMentionPickerOpen(false);
    setMentionSearchQuery("");
    setMentionStartIndex(-1);

    // Focus and set cursor after the mention
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      const newCursorPos = mentionStartIndex + username.length + 2; // +2 for @ and space
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    });
  }

  function insertAtSymbol() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const newValue = value.slice(0, cursorPos) + "@" + value.slice(cursorPos);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = cursorPos + 1;
      textarea.setSelectionRange(newPos, newPos);
      setCursorPosition(newPos);
    });
  }

  function handleGifSelect(gifUrl: string) {
    const textarea = textareaRef.current;
    const cursorPos = textarea?.selectionStart ?? value.length;
    // Only add leading newline if cursor is not at start and previous char is not a newline
    const needsLeadingNewline = cursorPos > 0 && value[cursorPos - 1] !== "\n";
    const gifMarkdown = needsLeadingNewline
      ? `\n![GIF](${gifUrl})\n`
      : `![GIF](${gifUrl})\n`;

    onChange(
      (prev) => prev.slice(0, cursorPos) + gifMarkdown + prev.slice(cursorPos),
    );

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const newPos = cursorPos + gifMarkdown.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }

  const handleFileUpload = async (file: File, index: number, total: number) => {
    // Validate file type and size
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const extension = file.name.split(".").pop() || "bin";
      const filename = `${crypto.randomUUID()}.${extension}`;
      const key = `chat_attachments/${filename}`;

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

      // Generate appropriate markdown based on file type
      const attachmentMarkdown = generateAttachmentMarkdown(
        file.name,
        publicUrl,
      );
      const markdown = `\n${attachmentMarkdown}\n`;

      onChange(
        (prev) => prev.slice(0, cursorPos) + markdown + prev.slice(cursorPos),
      );

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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
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
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
      {/* Hidden file input */}
      <input
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
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
        <div className="bg-white p-2 dark:bg-gray-800">
          <textarea
            className={cn(
              "block min-h-10 w-full resize-none border-0 bg-transparent px-2 py-2 text-sm text-gray-900",
              "focus:ring-0 focus:outline-none",
              "dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "box-border leading-normal",
              "custom-scrollbar",
              uploadingCount > 0 && "opacity-75",
              hasError && "ring-1 ring-red-500",
            )}
            id={id}
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setCursorPosition(e.target.selectionStart);
            }}
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            onKeyDown={(e) => {
              // Handle mention picker keyboard navigation
              if (isMentionPickerOpen) {
                if (
                  e.key === "ArrowDown" ||
                  e.key === "ArrowUp" ||
                  e.key === "Enter" ||
                  e.key === "Tab"
                ) {
                  // Let the MentionPicker handle these keys
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsMentionPickerOpen(false);
                  return;
                }
              }

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
      <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-700 dark:bg-gray-700/50">
        <div
          className="flex items-center gap-0.5 text-gray-600 dark:text-gray-300"
          role="toolbar"
          aria-label="Formatting tools"
        >
          {/* Action Bar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
                  buttonPadding,
                )}
                type="button"
                aria-label="Upload attachment"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCount > 0}
              >
                <PlusCircleIcon
                  size={iconSize}
                  aria-hidden="true"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs text-left whitespace-pre-line"
              side="top"
            >
              <p className="font-semibold">Supported file types:</p>
              <p className="mt-1 text-xs opacity-90">
                {getSupportedFileTypesDescription()}
              </p>
            </TooltipContent>
          </Tooltip>
          <button
            className={cn(
              "cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
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
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          <button
            className={cn(
              "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
              buttonPadding,
            )}
            type="button"
            aria-label="Add a GIF"
            onClick={() => setIsGiphyPickerOpen(true)}
          >
            <SmileIcon
              size={iconSize}
              aria-hidden="true"
            />
          </button>
          {mentionContext && (
            <button
              className={cn(
                "ml-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-600",
                buttonPadding,
              )}
              type="button"
              aria-label="Mention someone"
              onClick={insertAtSymbol}
            >
              <AtSignIcon
                size={iconSize}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        {children}
      </div>

      <GiphyPicker
        isOpen={isGiphyPickerOpen}
        onClose={() => setIsGiphyPickerOpen(false)}
        onSelectGif={handleGifSelect}
      />

      {mentionContext && (
        <MentionPicker
          isOpen={isMentionPickerOpen}
          onClose={() => setIsMentionPickerOpen(false)}
          onSelectUser={handleMentionSelect}
          context={mentionContext}
          searchQuery={mentionSearchQuery}
        />
      )}
    </div>
  );
}
