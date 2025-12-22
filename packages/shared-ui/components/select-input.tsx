import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "~/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends Omit<
  React.ComponentProps<"select">,
  "children"
> {
  options: SelectOption[];
  placeholder?: string;
}

function SelectInput({
  className,
  options,
  placeholder,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "block w-full appearance-none rounded-md bg-gray-800 py-1.5 pr-10 pl-3 text-base text-white outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm/6",
          className,
        )}
        data-slot="select"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}

export { SelectInput };
export type { SelectOption, SelectInputProps };
