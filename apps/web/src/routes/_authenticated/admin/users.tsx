import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import type { UserWithRole } from "better-auth/plugins/admin";
import { intlFormat } from "date-fns";
import { BanIcon, MailIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "~/components/confirm-dialog";
import EditUserSheet from "~/components/edit-user-sheet";
import { EmptyState } from "~/components/empty-state";
import Loading from "~/components/loading";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import { authClient } from "~/lib/auth.client";
import { cn } from "~/lib/utils";

// https://github.com/better-auth/better-auth/issues/3033
interface ExtendedUserWithRole extends UserWithRole {
  username?: string;
  color?: string | null;
}

export const Route = createFileRoute("/_authenticated/admin/users")({
  loader: async () => {
    const { data: users } = await authClient.admin.listUsers({
      query: { sortBy: "createdAt", sortDirection: "desc" },
    });

    return users;
  },
  component: AdminUsersPage,
  staleTime: 1000 * 60, // 1 minute
});

function AdminUsersPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const data = Route.useLoaderData();

  const [editingUser, setEditingUser] = useState<ExtendedUserWithRole | null>(
    null,
  );
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ExtendedUserWithRole | null>(
    null,
  );

  function handleEditUser(user: ExtendedUserWithRole) {
    setEditingUser(user);
    setIsEditSheetOpen(true);
  }

  function handleDeleteClick(user: ExtendedUserWithRole) {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    const toastId = toast.loading(
      `Deleting user: ${userToDelete.username || userToDelete.name}`,
    );

    const { error } = await authClient.admin.removeUser({
      userId: userToDelete.id,
    });

    if (error) {
      toast.error(
        `Failed to delete user: ${userToDelete.username || userToDelete.name}`,
        { id: toastId },
      );
      console.error(error);
      setUserToDelete(null);
      return;
    }

    toast.success(
      `Deleted user: ${userToDelete.username || userToDelete.name}`,
      { id: toastId },
    );

    setUserToDelete(null);
    router.invalidate();
  }

  if (!data) {
    return <Loading />;
  }

  // https://github.com/better-auth/better-auth/issues/3033
  const usersWithUsername = data.users as ExtendedUserWithRole[];

  return (
    <div className="pb-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-gray-900 md:text-3xl dark:text-white">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage all users registered in your application. You can
            impersonate, edit, or delete users from this panel.
          </p>
        </div>
      </div>

      {usersWithUsername.length !== 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table aria-label="Platform users with name, email, username, role, status, and actions">
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Username</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Verified</TableHeaderCell>
                    <TableHeaderCell>Created At</TableHeaderCell>
                    <TableHeaderCell>Updated At</TableHeaderCell>
                    <TableHeaderCell className="py-3.5 pr-4 pl-3 sm:pr-3">
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {usersWithUsername.map((user) => (
                    <TableBodyRow key={user.id}>
                      <TableBodyCell className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-3">
                        <span className="flex items-center gap-2">
                          <UserRoundIcon
                            size={16}
                            style={{
                              color: user.color
                                ? `#${user.color}`
                                : "currentColor",
                            }}
                            aria-hidden="true"
                          />
                          {user.name}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <MailIcon
                            size={16}
                            aria-hidden="true"
                          />
                          {user.email}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {user?.username || "Not set"}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700 ring-purple-500/50 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-blue-100 text-blue-700 ring-blue-500/50 dark:bg-blue-900/30 dark:text-blue-400",
                          )}
                        >
                          {user.role}
                        </span>
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {user.banned ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-500/50 ring-inset dark:bg-red-900/30 dark:text-red-400">
                            <BanIcon
                              size={14}
                              aria-hidden="true"
                            />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-500/50 ring-inset dark:bg-green-900/30 dark:text-green-400">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-yellow-500/50 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400">
                            No
                          </span>
                        )}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {intlFormat(new Date(user.createdAt), {
                          day: "numeric",
                          year: "numeric",
                          month: "long",
                          minute: "numeric",
                          hour: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {intlFormat(new Date(user.updatedAt), {
                          day: "numeric",
                          year: "numeric",
                          month: "long",
                          minute: "numeric",
                          hour: "numeric",
                        })}
                      </TableBodyCell>

                      <TableBodyCell className="sticky right-0 bg-inherit py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap text-gray-600 shadow-sm sm:pr-3 dark:text-gray-400">
                        <div className="flex justify-end gap-4">
                          <button
                            className="cursor-pointer text-green-400 no-underline hover:text-green-300 hover:underline"
                            onClick={async () => {
                              const { error } =
                                await authClient.admin.impersonateUser({
                                  userId: user.id,
                                });

                              if (error) {
                                toast.error(
                                  `Failed to impersonate user: ${user.username || user.name}`,
                                );
                                toast.error(
                                  `User status: ${user.banned ? "Banned" : "Active"}`,
                                );
                                console.error(error);

                                return;
                              }

                              toast.success(
                                `Started impersonating user: ${user.username || user.name}`,
                              );

                              navigate({ to: "/", reloadDocument: true });
                            }}
                          >
                            Impersonate
                            <span className="sr-only">, {user.name}</span>
                          </button>
                          <button
                            className="cursor-pointer text-blue-400 no-underline hover:text-blue-300 hover:underline"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                            <span className="sr-only">, {user.name}</span>
                          </button>
                          <button
                            className="cursor-pointer text-red-400 no-underline hover:text-red-300 hover:underline"
                            onClick={() => handleDeleteClick(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="No users found." />
      )}

      <EditUserSheet
        user={editingUser}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete user: ${userToDelete?.username || userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
