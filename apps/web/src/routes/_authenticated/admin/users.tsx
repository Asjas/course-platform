import { createFileRoute, useRouter } from "@tanstack/react-router";
import { BanIcon, MailIcon, UserRoundIcon } from "lucide-react";
import Loading from "~/components/loading.tsx";
import { authClient } from "~/lib/auth.client.ts";

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
  const data = Route.useLoaderData();

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="mb-20">
      <h1 className="mb-10 text-3xl font-bold">Users</h1>
      <div className="flex flex-col gap-4">
        {data.users.map((user) => (
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
              <p>Verified: {user?.verified ? "Yes" : "No"}</p>
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
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={async () => {
                    await authClient.admin.unbanUser({ userId: user.id });
                    router.invalidate();
                  }}
                >
                  Unban
                </button>
              ) : (
                <button
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => {
                  authClient.admin.impersonateUser({ userId: user.id });
                  router.invalidate();
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
