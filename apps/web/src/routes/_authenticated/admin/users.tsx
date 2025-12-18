import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import type { UserWithRole } from "better-auth/plugins/admin";
import { intlFormat } from "date-fns";
import { BanIcon, MailIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
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
  displayUsername?: string;
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

  if (!data) {
    return <Loading />;
  }

  // https://github.com/better-auth/better-auth/issues/3033
  const usersWithUsername = data.users as ExtendedUserWithRole[];

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-lg font-semibold text-white md:text-3xl">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage all users registered in your application. You can ban, unban,
            impersonate, or delete users from this panel.
          </p>
        </div>
      </div>

      {usersWithUsername.length !== 0 ? (
        <div className="mt-12 flow-root">
          <div className="custom-scrollbar overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Email
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Username
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Role
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Status
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Verified
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Created At
                    </TableHeaderCell>
                    <TableHeaderCell className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                      Updated At
                    </TableHeaderCell>
                    <TableHeaderCell className="py-3.5 pr-4 pl-3 sm:pr-3">
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>

                <TableBody>
                  {usersWithUsername.map((user) => (
                    <TableBodyRow key={user.id}>
                      <TableBodyCell className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-3">
                        <span className="flex items-center gap-2">
                          <UserRoundIcon size={16} />
                          {user.name}
                        </span>
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        <span className="flex items-center gap-2">
                          <MailIcon size={16} />
                          {user.email}
                        </span>
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {user?.username || "Not set"}
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                            user.role === "admin"
                              ? "bg-purple-900/30 text-purple-400 ring-purple-500/50"
                              : "bg-blue-900/30 text-blue-400 ring-blue-500/50",
                          )}
                        >
                          {user.role}
                        </span>
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {user.banned ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-900/30 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-500/50 ring-inset">
                            <BanIcon size={14} />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/50 ring-inset">
                            Active
                          </span>
                        )}
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center rounded-md bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/50 ring-inset">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-yellow-500/50 ring-inset">
                            No
                          </span>
                        )}
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {intlFormat(new Date(user.createdAt), {
                          day: "numeric",
                          year: "numeric",
                          month: "long",
                          minute: "numeric",
                          hour: "numeric",
                        })}
                      </TableBodyCell>
                      <TableBodyCell className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                        {intlFormat(new Date(user.updatedAt), {
                          day: "numeric",
                          year: "numeric",
                          month: "long",
                          minute: "numeric",
                          hour: "numeric",
                        })}
                      </TableBodyCell>
                      <TableBodyCell className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                        <div className="flex justify-end gap-4">
                          {user.banned ? (
                            <button
                              className="cursor-pointer text-green-600 no-underline hover:text-green-500 hover:underline"
                              onClick={async () => {
                                const { error } =
                                  await authClient.admin.unbanUser({
                                    userId: user.id,
                                  });

                                if (error) {
                                  toast.error(
                                    `Failed to unban user: ${user.username || user.name}`,
                                  );
                                  console.error(error);
                                  return;
                                }

                                router.invalidate();
                              }}
                            >
                              Unban
                              <span className="sr-only">, {user.name}</span>
                            </button>
                          ) : (
                            <button
                              className="cursor-pointer text-orange-600 no-underline hover:text-orange-500 hover:underline"
                              onClick={async () => {
                                const { error } =
                                  await authClient.admin.banUser({
                                    userId: user.id,
                                  });

                                if (error) {
                                  toast.error(
                                    `Failed to ban user: ${user.username || user.name}`,
                                  );
                                  console.error(error);
                                  return;
                                }

                                router.invalidate();
                              }}
                            >
                              Ban
                              <span className="sr-only">, {user.name}</span>
                            </button>
                          )}
                          <button
                            className="cursor-pointer text-green-600 no-underline hover:text-green-500 hover:underline"
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
                            className="cursor-pointer text-red-600 no-underline hover:text-red-500 hover:underline"
                            onClick={async () => {
                              if (
                                !confirm(
                                  `Are you sure you want to delete user: ${user.username || user.name}? This action cannot be undone.`,
                                )
                              ) {
                                return;
                              }

                              const toastId = toast.loading(
                                `Deleting user: ${user.username || user.name}`,
                              );

                              const { error } =
                                await authClient.admin.removeUser({
                                  userId: user.id,
                                });

                              if (error) {
                                toast.error(
                                  `Failed to delete user: ${user.username || user.name}`,
                                  { id: toastId },
                                );
                                console.error(error);
                                return;
                              }

                              toast.success(
                                `Deleted user: ${user.username || user.name}`,
                                { id: toastId },
                              );

                              router.invalidate();
                            }}
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
        <div className="mt-20 flex justify-center">
          <p className="text-md text-gray-300">No users found.</p>
        </div>
      )}
    </>
  );
}
