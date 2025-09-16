import { Link } from "@tanstack/react-router";
import NavLink from "~/components/ui/nav-link";

export default function Header() {
  return (
    <header className="fixed top-0 z-40 flex min-h-20 w-full flex-wrap items-center border-b border-gray-50/[0.02] bg-gray-900/40 backdrop-blur transition-colors duration-300 hover:bg-gray-900/60 lg:h-20">
      <nav className="xl:outer-xl bg-navy fixed top-0 z-50 flex w-full items-center justify-between p-4">
        <div className="flex min-h-10 items-center">
          <Link
            className="lg:min-w-logo mr-8 flex-shrink text-lg font-bold text-gray-900 dark:text-gray-50"
            to="/"
            aria-lable="Codewizard Training"
          >
            <img
              className="hidden max-h-9 w-auto rounded-sm dark:block"
              src="codewizard.png"
              alt="Codewizard Training"
            />
          </Link>
          <ul
            className="space-x-2 text-gray-700 lg:flex dark:text-gray-200"
            role="list"
          >
            <li className="relative inline-flex">
              <NavLink to="/">Home</NavLink>
            </li>
            <li className="relative inline-flex">
              <NavLink to="/blog">Blog</NavLink>
            </li>
            <li className="relative inline-flex">
              <NavLink to="/downloads">Downloads</NavLink>
            </li>
          </ul>
        </div>
        <div className="flex">
          <NavLink
            classes="bg-green-600"
            to="signin"
          >
            Sign In
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
