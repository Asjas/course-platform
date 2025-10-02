import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col rounded-lg border border-gray-700 p-8 transition-colors hover:border-green-600">
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center justify-between text-2xl font-bold">
      {children}
    </h3>
  );
}

export function CardPrice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <span className="text-4xl">{children}</span>
    </div>
  );
}

export function CardContentList({ children }: { children: ReactNode }) {
  return <ul className="mb-8 flex-grow space-y-3">{children}</ul>;
}

export function CardContentListItem({
  children,
  customClasses,
}: {
  children: ReactNode;
  customClasses?: string;
}) {
  return (
    <li className="flex items-start">
      <svg
        className={cn(
          "mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-green-400",
          customClasses,
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        ></path>
      </svg>
      <span className="text-gray-300">{children}</span>
    </li>
  );
}

export function CardAction({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <Link
      className="block w-full rounded-lg bg-gradient-to-r from-yellow-500 to-green-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition-all hover:from-yellow-700 hover:to-green-700 hover:shadow-xl"
      to={to}
    >
      {children}
    </Link>
  );
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-center text-sm text-gray-400">{children}</p>;
}
