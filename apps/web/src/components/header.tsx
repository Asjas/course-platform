import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button.tsx";
import { NavLink } from "~/components/ui/nav-link";
import { authClient } from "~/lib/auth.client.ts";

export default function Header() {
  const navigate = useNavigate();
  const { data } = authClient.useSession();

  const user = data?.user;
  const session = data?.session;

  return (
    <header className="fixed top-0 z-40 flex min-h-20 w-full flex-wrap items-center border-b border-gray-50/[0.02] bg-gray-900/40 backdrop-blur transition-colors duration-300 hover:bg-gray-900/60">
      <nav className="z-50 flex w-full items-center justify-between px-6 py-5">
        <div className="flex items-center">
          <Link
            className="mr-8 text-lg font-bold text-gray-900 dark:text-gray-50"
            to="/"
            aria-label="Codewizard Training"
          >
            <img
              className="block h-[36px] w-[113px] rounded-sm"
              src="/codewizard.svg"
              alt="Codewizard Training"
            />
          </Link>
          <ul className="space-x-2 text-gray-700 lg:flex dark:text-gray-200">
            <li className="relative inline-flex">
              <NavLink
                preload="intent"
                activeProps={{
                  className: "bg-gray-700 text-white dark:bg-gray-700",
                }}
                to="/"
              >
                Home
              </NavLink>
            </li>
            <li className="relative inline-flex">
              <NavLink
                preload="intent"
                activeProps={{
                  className: "bg-gray-700 text-white dark:bg-gray-700",
                }}
                to="/dashboard"
              >
                Support
              </NavLink>
            </li>
            {session ? (
              <li className="relative inline-flex border-l border-gray-600 pl-2">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className: "bg-gray-700 text-white dark:bg-gray-700",
                  }}
                  to="/dashboard"
                >
                  Dashboard
                </NavLink>
              </li>
            ) : null}
            {session ? (
              <li className="relative inline-flex">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className: "bg-gray-700 text-white dark:bg-gray-700",
                  }}
                  to="/dashboard"
                >
                  Chat
                </NavLink>
              </li>
            ) : null}
            {user?.role === "admin" ? (
              <li className="relative inline-flex border-l border-gray-600 pl-2">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className: "bg-gray-700 text-white dark:bg-gray-700",
                  }}
                  to="/admin"
                >
                  Admin
                </NavLink>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="flex">
          {session ? (
            <Button
              className="bg-green-600 text-white"
              onClick={async () => {
                await authClient.signOut();
                toast.success("Logged out successfully");

                navigate({ to: "/" });
              }}
            >
              Logout
            </Button>
          ) : (
            <NavLink
              className="bg-green-600"
              preload="intent"
              to="/signin"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
