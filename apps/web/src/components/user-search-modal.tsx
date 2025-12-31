import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "~/lib/trpc.client";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, userName: string) => void;
}

export function UserSearchModal({
  isOpen,
  onClose,
  onSelectUser,
}: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    ...trpc.directMessages.searchUsers.queryOptions({ searchTerm }),
    enabled: isOpen && searchTerm.length >= 2,
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
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="custom-scrollbar max-h-96 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              </div>
            ) : searchTerm && users && users.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <button
                    className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    key={user.id}
                    onClick={() =>
                      handleUserClick(user.id, user.username || user.name)
                    }
                    type="button"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold dark:bg-gray-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      {user.username && (
                        <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Start typing to search for users
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
