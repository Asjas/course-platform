import type { MentionableUser } from "@apps/server/src/routers/mentions";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "~/lib/trpc.client";
import { cn } from "~/lib/utils";

/**
 * Context type for the mention picker.
 * Determines which endpoint to use for fetching mentionable users.
 */
export type MentionContext =
  | { type: "channel"; channelId: string }
  | { type: "dm"; conversationId: string }
  | { type: "supportTicket"; ticketId: string };

interface MentionPickerProps {
  /**
   * Whether the picker is currently visible
   */
  isOpen: boolean;
  /**
   * Callback when the picker should be closed
   */
  onClose: () => void;
  /**
   * Callback when a user is selected
   */
  onSelectUser: (user: MentionableUser) => void;
  /**
   * The context for fetching mentionable users
   */
  context: MentionContext;
  /**
   * Optional search query to filter users
   */
  searchQuery?: string;
  /**
   * Position of the picker (for absolute positioning near cursor)
   */
  position?: { top: number; left: number };
}

export function MentionPicker({
  isOpen,
  onClose,
  onSelectUser,
  context,
  searchQuery = "",
  position,
}: MentionPickerProps) {
  // Track the search query that was active when selection was made
  const [selectionState, setSelectionState] = useState<{
    query: string;
    index: number;
  }>({ query: "", index: 0 });
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch mentionable users based on context
  const { data: users = [], isLoading } = useQuery({
    ...(() => {
      switch (context.type) {
        case "channel":
          return trpc.mentions.getChannelMentions.queryOptions({
            channelId: context.channelId,
          });
        case "dm":
          return trpc.mentions.getDMMentions.queryOptions({
            conversationId: context.conversationId,
          });
        case "supportTicket":
          return trpc.mentions.getSupportTicketMentions.queryOptions({
            ticketId: context.ticketId,
          });
      }
    })(),
    enabled: isOpen,
  });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.displayUsername?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  // Compute effective selected index:
  // - Reset to 0 if search query changed
  // - Otherwise clamp to valid range
  const effectiveSelectedIndex = useMemo(() => {
    // If search query changed, reset to 0
    if (selectionState.query !== searchQuery) {
      return 0;
    }
    // Otherwise clamp to valid range
    return Math.min(
      selectionState.index,
      Math.max(0, filteredUsers.length - 1),
    );
  }, [selectionState, searchQuery, filteredUsers.length]);

  // Helper to update selection - memoized to avoid effect re-runs
  const updateSelection = useCallback(
    (index: number) => {
      setSelectionState({ query: searchQuery, index });
    },
    [searchQuery],
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current || filteredUsers.length === 0) return;

    const selectedItem = listRef.current.children[
      effectiveSelectedIndex
    ] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  }, [effectiveSelectedIndex, filteredUsers.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          updateSelection(
            effectiveSelectedIndex < filteredUsers.length - 1
              ? effectiveSelectedIndex + 1
              : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          updateSelection(
            effectiveSelectedIndex > 0
              ? effectiveSelectedIndex - 1
              : filteredUsers.length - 1,
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (filteredUsers[effectiveSelectedIndex]) {
            onSelectUser(filteredUsers[effectiveSelectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    filteredUsers,
    effectiveSelectedIndex,
    onSelectUser,
    onClose,
    searchQuery,
    updateSelection,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 max-h-60 w-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800",
      )}
      style={
        position
          ? { top: position.top, left: position.left }
          : { bottom: "100%", left: 0, marginBottom: "4px" }
      }
    >
      {isLoading ? (
        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {searchQuery ? "No users found" : "No users to mention"}
        </div>
      ) : (
        <ul
          className="py-1"
          ref={listRef}
          role="listbox"
          aria-label="Mentionable users"
        >
          {filteredUsers.map((user, index) => (
            <li
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                index === effectiveSelectedIndex
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
              key={user.id}
              role="option"
              aria-selected={index === effectiveSelectedIndex}
              tabIndex={-1}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectUser(user);
                  onClose();
                }
              }}
              onMouseEnter={() => updateSelection(index)}
            >
              {/* Avatar */}
              {user.image ? (
                <img
                  className="size-6 rounded-full object-cover"
                  src={user.image}
                  alt=""
                />
              ) : (
                <div className="flex size-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name and username */}
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.name}
                </span>
                {user.displayUsername || user.username ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    @{user.displayUsername || user.username}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
