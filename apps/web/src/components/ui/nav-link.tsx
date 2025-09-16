import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

export default function NavLink({
  children,
  to,
  classes,
}: {
  children: string;
  to: string;
  classes?: string;
}) {
  return (
    <Link
      className={cn(
        classes,
        "inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold leading-6 hover:bg-gray-100 dark:hover:bg-gray-700",
      )}
      activeProps={{
        className: "bg-gray-700 text-white dark:bg-gray-700",
      }}
      to={to}
    >
      {children}
    </Link>
  );
}
