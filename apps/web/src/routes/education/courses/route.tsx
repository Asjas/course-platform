import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/education/courses")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="flex h-14 w-full flex-row">
        <div className="w-full border-y border-gray-300 bg-gray-100 lg:flex lg:flex-col dark:border-gray-600 dark:bg-gray-800">
          <nav
            className="flex h-14"
            aria-label="Breadcrumb"
          >
            <ol className="flex w-full items-center px-4 sm:px-6 lg:px-8">
              <li className="flex">
                <div className="flex items-center">
                  <Link
                    className="text-md truncate text-gray-800 transition-colors duration-150 dark:text-gray-100"
                    to="/education/courses"
                  >
                    Courses
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex-row justify-end border-y border-gray-300 bg-gray-100 lg:flex lg:w-3/5 dark:border-gray-600 dark:bg-gray-800"></div>
      </div>
      <Outlet />
    </>
  );
}
