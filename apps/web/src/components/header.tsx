import { Link } from "@tanstack/react-router";
import { NavLink } from "~/components/ui/nav-link";

export default function Header() {
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
          <ul
            className="space-x-2 text-gray-700 lg:flex dark:text-gray-200"
            role="list"
          >
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
                to="/blog"
              >
                Blog
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="flex">
          <NavLink
            className="bg-green-600"
            preload="intent"
            to="/signin"
          >
            Sign In
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
