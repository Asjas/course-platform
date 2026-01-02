import {
  EditorTabs,
  EditorToolbar,
  FileUploadFooter,
} from "./components/index.js";
import {
  useFileUpload,
  useMarkdownPreview,
  useMentionPicker,
} from "./hooks/index.js";
import type { EditorTab, GitHubMessageEditorProps } from "./types.js";
import { useRef, useState } from "react";
import { MentionPicker } from "~/components/mention-picker";
import { cn } from "~/lib/utils";

export default function GitHubMessageEditor({
  id,
  value,
  onChange,
  placeholder = "Add your comment...",
  mentionContext,
}: GitHubMessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>("write");
  const [cursorPosition, setCursorPosition] = useState(0);

  // Custom hooks for separated concerns
  const { preview, isPreviewLoading } = useMarkdownPreview(value);

  const { uploadingCount, handleDragOver, handleDrop, handleFileSelect } =
    useFileUpload({ value, onChange, textareaRef });

  const {
    isMentionPickerOpen,
    setIsMentionPickerOpen,
    mentionSearchQuery,
    handleMentionSelect,
    insertAtSymbol,
  } = useMentionPicker({
    value,
    cursorPosition,
    mentionContext,
    onChange,
    textareaRef,
    setCursorPosition,
  });

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 dark:border-gray-700">
      {/* Editor Header */}
      <div className="flex justify-between border-b-[1px] border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <EditorTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isPreviewLoading={isPreviewLoading}
        />

        {activeTab === "write" && (
          <EditorToolbar
            textareaRef={textareaRef}
            value={value}
            onChange={onChange}
            mentionContext={mentionContext}
            onMentionClick={insertAtSymbol}
          />
        )}
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
          <div className="bg-gray-100 p-2 dark:bg-gray-900">
            <textarea
              className={cn(
                "size-to-fit block min-h-45 w-full resize-y rounded-sm bg-white p-4 text-sm text-gray-900",
                "focus:ring-1 focus:ring-green-500 focus:outline-none",
                "dark:bg-gray-900 dark:text-white",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "box-border leading-normal",
                "custom-scrollbar",
                uploadingCount > 0 && "opacity-75",
              )}
              id={id}
              ref={textareaRef}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onSelect={(e) =>
                setCursorPosition(e.currentTarget.selectionStart)
              }
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
              }}
              spellCheck
              wrap="soft"
              disabled={uploadingCount > 0}
            />
          </div>

          {/* Upload Button & Drag Hint */}
          <div className="absolute top-2 right-2"></div>
        </div>
      ) : (
        <div className="custom-scrollbar min-h-45 overflow-auto bg-white dark:bg-gray-900">
          <div
            className={cn(
              "min-w-fit text-base",
              "prose prose-sm dark:prose-invert p-6",
              "text-gray-900 dark:text-white",
              "[&_code]:overflow-visible! [&_pre]:overflow-visible!",
            )}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      {/* File Upload Footer */}
      <FileUploadFooter
        uploadingCount={uploadingCount}
        onFileSelect={handleFileSelect}
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
