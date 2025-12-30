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
      <nav className="flex min-w-[180px] flex-col border-r border-gray-300 bg-gray-900 px-2 py-3 dark:border-gray-700 dark:bg-gray-900">
        <span className="mb-2 px-2 text-sm font-bold tracking-wide text-gray-400 uppercase">
          Channels
        </span>
        <ul className="flex flex-col gap-0.5">
          {channels.map((channel) => (
            <li key={channel}>
              <Link
                className="flex h-7 w-full items-center rounded px-2 text-sm text-gray-300 hover:bg-gray-700/50"
                activeProps={{
                  className: "bg-blue-600 text-white hover:bg-blue-600",
                }}
                activeOptions={{ exact: true }}
                to="/chat/$channelId"
                params={{ channelId: channel }}
              >
                <span className="font-normal"># {channel}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="bg-gray-800">
        <Outlet />
      </main>
    </div>
  );
}
