import { useMutation } from "@tanstack/react-query";
import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  TextQuoteIcon,
} from "lucide-react";
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
      <div className="flex justify-between border-b-[1px] border-gray-700 bg-gray-800">
        <div className="-mb-px pt-2.5">
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

        {activeTab === "write" ? (
          <div className="mt-1 mr-3 flex items-center text-xs text-white">
            {/* Action Bar */}
            <button
              className="cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add header text"
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
              <HeadingIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add bold text"
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

                if (
                  isBold &&
                  boldStart !== undefined &&
                  boldEnd !== undefined
                ) {
                  // Remove bold markdown, keep the inner text
                  onChange(
                    (prev) =>
                      prev.slice(0, boldStart) +
                      innerText +
                      prev.slice(boldEnd),
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
              <BoldIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add italic text"
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
                    (endIndex + 1 >= value.length ||
                      value[endIndex + 1] !== "_")
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
              <ItalicIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Insert a quote"
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const value = textarea.value;
                const selectedText = value.slice(start, end);

                // Helper: Check if cursor is at start of line
                const isAtStartOfLine =
                  start === 0 || value[start - 1] === "\n";

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
                    (prev) =>
                      prev.slice(0, start) + insertText + prev.slice(end),
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
                    (prev) =>
                      prev.slice(0, start) + insertText + prev.slice(end),
                  );

                  requestAnimationFrame(() => {
                    textarea.focus();
                    const cursorPos = start + insertText.indexOf("> ") + 2;
                    textarea.setSelectionRange(cursorPos, cursorPos);
                  });
                }
              }}
            >
              <TextQuoteIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add inline code"
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

                if (
                  isCode &&
                  codeStart !== undefined &&
                  codeEnd !== undefined
                ) {
                  // Remove code markdown
                  onChange(
                    (prev) =>
                      prev.slice(0, codeStart) +
                      innerText +
                      prev.slice(codeEnd),
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
              <CodeIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add a link"
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
              <LinkIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add a bulleted list"
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const value = textarea.value;
                const selectedText = value.slice(start, end);

                // Helper: Check if cursor is at start of line
                const isAtStartOfLine =
                  start === 0 || value[start - 1] === "\n";

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
                    (prev) =>
                      prev.slice(0, start) + insertText + prev.slice(end),
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
                    (prev) =>
                      prev.slice(0, start) + insertText + prev.slice(end),
                  );

                  requestAnimationFrame(() => {
                    textarea.focus();
                    const cursorPos = start + insertText.indexOf("- ") + 2;
                    textarea.setSelectionRange(cursorPos, cursorPos);
                  });
                }
              }}
            >
              <ListIcon size={16} />
            </button>
            <button
              className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-600"
              title="Add a numbered list"
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
                    (prev) =>
                      prev.slice(0, start) + insertText + prev.slice(end),
                  );

                  requestAnimationFrame(() => {
                    textarea.focus();
                    const cursor = start + insertText.length;
                    textarea.setSelectionRange(cursor, cursor);
                  });
                }
              }}
            >
              <ListOrderedIcon size={16} />
            </button>
          </div>
        ) : null}
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
                "size-to-fit block min-h-[180px] w-full resize-y rounded-sm bg-white p-4 text-sm text-gray-900",
                "focus:ring-1 focus:ring-green-500 focus:outline-none",
                "dark:bg-gray-900 dark:text-white",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "box-border border border-gray-600 leading-normal",
                "custom-scrollbar",
                uploadingCount > 0 && "opacity-75",
              )}
              id={id}
              ref={textareaRef}
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
        <div className="custom-scrollbar max-h-[800px] min-h-[180px] overflow-auto bg-gray-900">
          <div
            className={cn(
              "min-w-fit text-base",
              "prose prose-sm prose-invert p-6",
              "text-white",
              "[&_code]:overflow-visible! [&_pre]:overflow-visible!",
            )}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
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
