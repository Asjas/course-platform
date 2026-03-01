import {
  insertBulletList,
  insertHeader,
  insertLink,
  insertNumberedList,
  insertQuote,
  toggleBold,
  toggleCode,
  toggleItalic,
} from "../formatting/index";
import type { FormattingParams } from "../types";
import {
  AtSignIcon,
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  TextQuoteIcon,
} from "lucide-react";
import type { MentionContext } from "~/components/mention-picker";

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  mentionContext?: MentionContext;
  onMentionClick: () => void;
}

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ComponentType<{ "size": number; "aria-hidden": boolean }>;
  handler: (params: FormattingParams) => void;
  className?: string;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    id: "header",
    label: "Add header text",
    icon: HeadingIcon,
    handler: insertHeader,
  },
  {
    id: "bold",
    label: "Add bold text",
    icon: BoldIcon,
    handler: toggleBold,
    className: "ml-1",
  },
  {
    id: "italic",
    label: "Add italic text",
    icon: ItalicIcon,
    handler: toggleItalic,
    className: "ml-1",
  },
  {
    id: "quote",
    label: "Insert a quote",
    icon: TextQuoteIcon,
    handler: insertQuote,
    className: "ml-1",
  },
  {
    id: "code",
    label: "Add inline code",
    icon: CodeIcon,
    handler: toggleCode,
    className: "ml-1",
  },
  {
    id: "link",
    label: "Add a link",
    icon: LinkIcon,
    handler: insertLink,
    className: "ml-1",
  },
  {
    id: "bullet-list",
    label: "Add a bulleted list",
    icon: ListIcon,
    handler: insertBulletList,
    className: "ml-1",
  },
  {
    id: "numbered-list",
    label: "Add a numbered list",
    icon: ListOrderedIcon,
    handler: insertNumberedList,
    className: "ml-1",
  },
];

export function EditorToolbar({
  textareaRef,
  value,
  onChange,
  mentionContext,
  onMentionClick,
}: EditorToolbarProps) {
  function handleButtonClick(handler: (params: FormattingParams) => void) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    handler({ textarea, value, onChange });
  }

  return (
    <div
      className="mr-3 flex items-center text-xs text-gray-900 dark:text-white"
      role="toolbar"
      aria-label="Formatting tools"
    >
      {TOOLBAR_BUTTONS.map((button) => {
        const Icon = button.icon;
        return (
          <button
            className={`cursor-pointer rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-600 ${button.className ?? ""}`}
            key={button.id}
            type="button"
            aria-label={button.label}
            onClick={() => handleButtonClick(button.handler)}
          >
            <Icon
              size={16}
              aria-hidden={true}
            />
          </button>
        );
      })}
      {mentionContext && (
        <button
          className="ml-1 cursor-pointer rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-600"
          type="button"
          aria-label="Mention someone"
          onClick={onMentionClick}
        >
          <AtSignIcon
            size={16}
            aria-hidden={true}
          />
        </button>
      )}
    </div>
  );
}
