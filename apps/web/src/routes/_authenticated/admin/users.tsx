import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import type { UserWithRole } from "better-auth/plugins/admin";
import { BanIcon, MailIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
import Loading from "~/components/loading";
import { authClient } from "~/lib/auth.client";

interface ExtendedUserWithRole extends UserWithRole {
  username?: string;
  displayUsername?: string;
}

export const Route = createFileRoute("/_authenticated/admin/users")({
  loader: async () => {
    const { data: users } = await authClient.admin.listUsers({
      query: { sortBy: "createdAt", sortDirection: "asc" },
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
    <div className="mb-20">
      <h1 className="mb-10 text-3xl font-bold">Users</h1>
      <div className="flex flex-col gap-4">
        {usersWithUsername.map((user) => (
          <div
            className="rounded-md border border-gray-400 px-4 py-6"
            key={user.id}
          >
            <div className="mb-4 flex justify-between">
              <p>User ID: {user.id}</p>
              <p>Role: {user.role}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="flex items-center gap-2">
                <MailIcon /> {user.email}
              </p>
              <p>Verified: {user?.emailVerified ? "Yes" : "No"}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="flex items-center gap-2">
                <UserRoundIcon />
                {user.name}
              </p>
              <p>Username: {user?.username ? user.username : "Not set"}</p>
            </div>
            <div className="mb-4 flex justify-between">
              <p className="flex items-center gap-2">
                <BanIcon color={user.banned ? "red" : "green"} />
                {user.banned ? "Banned" : "Active"}
              </p>
              {user.banned ? (
                <button
                  className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 active:bg-green-800"
                  onClick={async () => {
                    await authClient.admin.unbanUser({ userId: user.id });
                    router.invalidate();
                  }}
                >
                  Unban
                </button>
              ) : (
                <button
                  className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 active:bg-red-800"
                  onClick={async () => {
                    await authClient.admin.banUser({ userId: user.id });
                    router.invalidate();
                  }}
                >
                  Ban
                </button>
              )}
            </div>
            <div className="mb-4 flex justify-between">
              <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
              <p>Updated At: {new Date(user.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <button
                className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
                onClick={async () => {
                  const { error } = await authClient.admin.impersonateUser({
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
                Impersonate User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
