import type { ReactNode } from "react";

interface ILabel {
  children: ReactNode;
  htmlFor: string;
}

function Label({ children, htmlFor }: ILabel) {
  return (
    <label
      className="flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export { Label };
