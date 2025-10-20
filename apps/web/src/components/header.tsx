import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button.tsx";
import { NavLink } from "~/components/ui/nav-link";
import type { AuthState } from "~/lib/auth.context.ts";

export default function Header({ auth }: { auth: AuthState }) {
  const navigate = useNavigate();

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
                to="/support"
              >
                Support
              </NavLink>
            </li>
            {auth.isAuthenticated ? (
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
            {auth.isAuthenticated ? (
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
            {auth.isAuthenticated && auth.hasRole("admin") ? (
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
          {auth.isAuthenticated ? (
            <Button
              className="bg-green-600 text-white"
              onClick={async () => {
                await auth.signOut();

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
