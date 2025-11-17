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
      <div className="flex flex-col gap-1 bg-gray-900 px-2">
        <span className="mt-2 flex px-2 py-2 text-lg md:text-xl">Channels</span>
        <div className="flex flex-col gap-1">
          {channels.map((channel) => (
            <Link
              className="flex h-8 w-full items-center rounded-md px-2 py-2 hover:bg-gray-800"
              activeProps={{ className: "bg-gray-800" }}
              activeOptions={{ exact: true }}
              key={channel}
              to="/chat/$channelId"
              params={{ channelId: channel }}
            >
              <span># {channel}</span>
            </Link>
          ))}
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
