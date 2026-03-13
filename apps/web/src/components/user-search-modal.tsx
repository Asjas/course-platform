import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "~/lib/auth.context";
import {
  SearchableUsersCollection,
  useSearchableUsers,
} from "~/lib/db.collections";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, userName: string) => void;
}

const ROW_HEIGHT = 48;
const MAX_HEIGHT = 80;

export function UserSearchModal({
  isOpen,
  onClose,
  onSelectUser,
}: UserSearchModalProps) {
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  // Preload users when modal opens
  useEffect(() => {
    if (isOpen) {
      SearchableUsersCollection.preload();
    }
  }, [isOpen]);

  // Get all users from collection
  const { data: allUsersMap, isLoading } = useSearchableUsers();

  // Client-side filter the users
  const filteredUsers = useMemo(() => {
    if (!allUsersMap) return [];

    const allUsers = Object.values(allUsersMap);
    const lowerSearchTerm = searchTerm.toLowerCase();
    const currentUserId = auth.session?.user.id;

    return allUsers.filter((user) => {
      // Exclude current user
      if (currentUserId && user.id === currentUserId) {
        return false;
      }
      // If no search term, include all users
      if (!lowerSearchTerm) {
        return true;
      }
      // Filter by name or username (case-insensitive)
      const nameMatch = user.name.toLowerCase().includes(lowerSearchTerm);
      const usernameMatch =
        user.username?.toLowerCase().includes(lowerSearchTerm) ?? false;
      return nameMatch || usernameMatch;
    });
  }, [allUsersMap, searchTerm, auth.session?.user.id]);

  const virtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  function handleUserClick(userId: string, userName: string) {
    onSelectUser(userId, userName);
    onClose();
    setSearchTerm("");
  }

  return (
    <Dialog
      className="relative z-50"
      open={isOpen}
      onClose={onClose}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Users
            </DialogTitle>
            <button
              className="cursor-pointer rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                type="text"
                placeholder="Filter by username or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div
            className="custom-scrollbar overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700"
            ref={parentRef}
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading users...
                </div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const user = filteredUsers[virtualRow.index];
                  return (
                    <button
                      className="absolute top-0 left-0 flex w-full cursor-pointer items-center gap-3 px-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      key={user.id}
                      onClick={() =>
                        handleUserClick(user.id, user.username || user.name)
                      }
                      type="button"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {user.image ? (
                        <img
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                          src={user.image}
                          alt={`${user.name}'s avatar`}
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold dark:bg-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate text-base font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
