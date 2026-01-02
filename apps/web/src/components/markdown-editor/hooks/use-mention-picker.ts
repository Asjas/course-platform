import type { MentionUser } from "../types.js";
import { useCallback, useMemo, useState } from "react";
import type { MentionContext } from "~/components/mention-picker";

interface UseMentionPickerParams {
  value: string;
  cursorPosition: number;
  mentionContext?: MentionContext;
  onChange: (value: string | ((prev: string) => string)) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setCursorPosition: (pos: number) => void;
}

interface UseMentionPickerResult {
  isMentionPickerOpen: boolean;
  setIsMentionPickerOpen: (open: boolean) => void;
  mentionSearchQuery: string;
  handleMentionSelect: (user: MentionUser) => void;
  insertAtSymbol: () => void;
}

interface MentionState {
  isOpen: boolean;
  searchQuery: string;
  startIndex: number;
}

function computeMentionState(
  value: string,
  cursorPosition: number,
  hasMentionContext: boolean,
): MentionState {
  const closedState: MentionState = {
    isOpen: false,
    searchQuery: "",
    startIndex: -1,
  };

  if (!hasMentionContext) return closedState;

  // Find the @ symbol before the cursor
  const textBeforeCursor = value.slice(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

  if (lastAtIndex === -1) return closedState;

  // Check if there's a space between @ and cursor (which means mention is complete)
  const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
  const hasSpace = textAfterAt.includes(" ");

  if (hasSpace) return closedState;

  // Check if @ is at start of text or preceded by whitespace
  const charBeforeAt = value[lastAtIndex - 1];
  const isValidStart =
    lastAtIndex === 0 ||
    charBeforeAt === " " ||
    charBeforeAt === "\n" ||
    charBeforeAt === undefined;

  if (!isValidStart) return closedState;

  // Valid mention trigger
  return {
    isOpen: true,
    searchQuery: textAfterAt,
    startIndex: lastAtIndex,
  };
}

/**
 * Hook to manage mention picker state and interactions
 * Uses derived state pattern to avoid setState in effects
 */
export function useMentionPicker({
  value,
  cursorPosition,
  mentionContext,
  onChange,
  textareaRef,
  setCursorPosition,
}: UseMentionPickerParams): UseMentionPickerResult {
  // Manual close state - when user presses Escape
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);

  // Compute mention state synchronously from props (derived state)
  const computedState = useMemo(
    () => computeMentionState(value, cursorPosition, !!mentionContext),
    [value, cursorPosition, mentionContext],
  );

  // Reset manual close when user types @ again
  const isMentionPickerOpen = computedState.isOpen && !isManuallyClosed;

  // When computed state changes to open (user typed @), reset manual close
  const setIsMentionPickerOpen = useCallback((open: boolean) => {
    // If closing, set manually closed
    if (!open) {
      setIsManuallyClosed(true);
    } else {
      setIsManuallyClosed(false);
    }
  }, []);

  const mentionSearchQuery = computedState.searchQuery;
  const mentionStartIndex = computedState.startIndex;

  const handleMentionSelect = useCallback(
    (user: MentionUser) => {
      if (mentionStartIndex === -1) return;

      // Replace @query with @username
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterCursor = value.slice(cursorPosition);
      const username = user.displayUsername || user.username || user.name;
      const newValue = `${beforeMention}@${username} ${afterCursor}`;

      onChange(newValue);
      setIsManuallyClosed(true);

      // Focus and set cursor after the mention
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        const newCursorPos = mentionStartIndex + username.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      });
    },
    [
      value,
      cursorPosition,
      mentionStartIndex,
      onChange,
      textareaRef,
      setCursorPosition,
    ],
  );

  const insertAtSymbol = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const newValue = value.slice(0, cursorPos) + "@" + value.slice(cursorPos);

    onChange(newValue);
    setIsManuallyClosed(false); // Reset so picker opens

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = cursorPos + 1;
      textarea.setSelectionRange(newPos, newPos);
      setCursorPosition(newPos);
    });
  }, [value, onChange, textareaRef, setCursorPosition]);

  return {
    isMentionPickerOpen,
    setIsMentionPickerOpen,
    mentionSearchQuery,
    handleMentionSelect,
    insertAtSymbol,
  };
}
