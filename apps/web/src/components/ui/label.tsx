import type { ReactNode } from "react";

interface ILabel {
  children: ReactNode;
  htmlFor: string;
}

function Label({ children, htmlFor }: ILabel) {
  return (
    <label
      className="flex items-center gap-2 text-sm leading-none font-medium text-gray-900 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:text-white"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export { Label };
