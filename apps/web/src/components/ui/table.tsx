import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="relative min-w-full divide-y divide-white/15">
      {children}
    </table>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableHeaderRow({ children }: { children: ReactNode }) {
  return <tr className="bg-gray-700/50">{children}</tr>;
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
      className={`py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white sm:pl-3 ${className}`}
      scope={scope}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="bg-gray-900">{children}</tbody>;
}

export function TableBodyRow({ children }: { children: ReactNode }) {
  return <tr className="even:bg-gray-800/50">{children}</tr>;
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
      className={`py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white sm:pl-3 ${className}`}
    >
      {children}
    </td>
  );
}
