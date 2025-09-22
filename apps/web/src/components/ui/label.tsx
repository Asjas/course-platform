import type { ReactNode } from "react";

interface ILabel {
  children: ReactNode;
  htmlFor: string;
}

function Label({ children, htmlFor }: ILabel) {
  return (
    <label
      className="flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export { Label };
