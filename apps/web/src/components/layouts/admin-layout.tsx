import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sidebar mt-10 flex h-full md:mt-0">
      <div className="relative flex flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 px-2 dark:border-gray-700 dark:bg-gray-900">
        <nav className="flex flex-1 flex-col">
          <span className="mt-2 flex p-2 text-lg font-bold text-gray-900 md:text-xl dark:text-white">
            Admin
          </span>
          <ul className="flex flex-1 flex-col gap-y-1 pt-4">
            <li>
              <Link
                className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                activeProps={{ className: "bg-gray-200 dark:bg-gray-800" }}
                activeOptions={{ exact: true }}
                to="/admin/users"
              >
                Users
              </Link>
            </li>
            <li>
              <Link
                className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                activeProps={{ className: "bg-gray-200 dark:bg-gray-800" }}
                activeOptions={{ exact: true }}
                to="/admin/coupons"
              >
                Coupons
              </Link>
            </li>
            <li>
              <Link
                className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                activeProps={{ className: "bg-gray-200 dark:bg-gray-800" }}
                activeOptions={{ exact: true }}
                to="/admin/courses"
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                className="flex h-8 w-full items-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                activeProps={{ className: "bg-gray-200 dark:bg-gray-800" }}
                activeOptions={{ exact: true }}
                to="/admin/purchases"
              >
                Purchases
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <main className="flex w-full flex-col bg-white px-6 py-8 dark:bg-gray-800">
        {children}
      </main>
    </div>
  );
}
