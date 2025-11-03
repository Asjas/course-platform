import { Link } from "@tanstack/react-router";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-6 mt-10 flex h-full md:mt-0">
      <div className="relative flex w-50 flex-col gap-y-5 overflow-y-auto bg-gray-900 md:w-72">
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-4 pt-8">
            <li>
              <Link
                className="flex h-12 w-full items-center px-4 text-center hover:bg-gray-800"
                to="/admin/users"
              >
                Users
              </Link>
            </li>
            <li>
              <Link
                className="flex h-12 w-full items-center px-4 text-center hover:bg-gray-800"
                to="/admin/coupons"
              >
                Coupons
              </Link>
            </li>
            <li>
              <Link
                className="flex h-12 w-full items-center px-4 text-center hover:bg-gray-800"
                to="/admin/courses"
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                className="flex h-12 w-full items-center px-4 text-center hover:bg-gray-800"
                to="/admin/purchases"
              >
                Purchases
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <section className="flex w-full flex-col px-6 py-8">{children}</section>
    </div>
  );
}
