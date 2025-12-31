import type { EmojiClickData } from "emoji-picker-react";
import { SmilePlusIcon } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";

// Lazy load the emoji picker to reduce initial bundle size
const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface EmojiReactionPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  /**
   * Button style variant:
   * - "inline": Gray background, matches reaction badges (used when shown inline with reactions)
   * - "action": White background with border (used in hover action bar)
   */
  variant?: "inline" | "action";
}

export function EmojiReactionPicker({
  onEmojiSelect,
  className = "",
  variant = "action",
}: EmojiReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  }

  const buttonStyles =
    variant === "inline"
      ? "inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-600/60 p-1 text-gray-200 transition-colors hover:bg-gray-600/80"
      : "cursor-pointer rounded border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600";

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        className={`${buttonStyles} ${className}`}
        aria-label="Add reaction"
      >
        <SmilePlusIcon
          className={
            variant === "action" ? "text-gray-600 dark:text-gray-300" : ""
          }
          size={16}
        />
      </Button>
      <Popover
        className="z-50"
        placement="top"
      >
        <Dialog className="outline-none">
          <Suspense
            fallback={
              <div className="flex h-[350px] w-[350px] items-center justify-center rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <span className="text-gray-500">Loading...</span>
              </div>
            }
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              searchPlaceholder="Search emoji..."
              width={350}
              height={350}
              previewConfig={{ showPreview: false }}
            />
          </Suspense>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
