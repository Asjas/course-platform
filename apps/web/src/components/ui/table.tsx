import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
      {children}
    </table>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-gray-200/80 dark:bg-gray-700/50">{children}</tr>;
}

export function TableHeaderCell({
  children,
  className = "",
  scope = "col",
}: {
  children: ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th
      className={`py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-3 dark:text-white ${className}`}
      scope={scope}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
      {children}
    </tbody>
  );
}

export function TableBodyRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-0 odd:bg-white even:bg-gray-100/80 dark:odd:bg-gray-900 dark:even:bg-gray-700/25">
      {children}
    </tr>
  );
}

export function TableBodyCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3 dark:text-white ${className}`}
    >
      {children}
    </td>
  );
}
