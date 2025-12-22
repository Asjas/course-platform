import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/chat" || location.pathname === "/chat/") {
      throw redirect({
        to: "/chat/$channelId",
        params: { channelId: "general" },
      });
    }
  },
  component: AuthenticatedChatPage,
});

const channels = ["general", "random"];

function AuthenticatedChatPage() {
  return (
    <div className="sidebar h-full">
      <nav className="flex flex-col gap-1 border-r border-gray-200 bg-gray-50 px-2 dark:border-gray-700 dark:bg-gray-900">
        <span className="mt-2 flex px-2 py-2 text-lg font-bold text-gray-900 md:text-xl dark:text-white">
          Channels
        </span>
        <div className="flex flex-col gap-2">
          <ul className="flex flex-1 flex-col gap-y-1 pt-4">
            {channels.map((channel) => (
              <li>
                <Link
                  className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                  activeProps={{
                    className: "bg-gray-200 dark:bg-gray-800",
                  }}
                  activeOptions={{ exact: true }}
                  key={channel}
                  to="/chat/$channelId"
                  params={{ channelId: channel }}
                >
                  <span># {channel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
