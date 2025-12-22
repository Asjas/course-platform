import type { ReactNode } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  Popover as AriaPopover,
  type MenuItemProps,
  type MenuProps,
  type PopoverProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";

export function MenuPopover({
  children,
  className,
  ...props
}: PopoverProps & { children: ReactNode }) {
  return (
    <AriaPopover
      className={cn("z-50", className)}
      {...props}
    >
      {children}
    </AriaPopover>
  );
}

export function Menu<T extends object>({
  children,
  className,
  ...props
}: MenuProps<T> & { children: ReactNode }) {
  return (
    <AriaMenu
      className={cn(
        "min-w-32 rounded-md border border-gray-600 bg-white p-1 shadow-lg dark:bg-gray-800",
        className,
      )}
      {...props}
    >
      {children}
    </AriaMenu>
  );
}

export function MenuItem({
  children,
  className,
  isSelected,
  ...props
}: MenuItemProps & { children: ReactNode; isSelected?: boolean }) {
  return (
    <AriaMenuItem
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
        isSelected
          ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
          : "text-gray-700 dark:text-gray-300",
        className,
      )}
      {...props}
    >
      {children}
    </AriaMenuItem>
  );
}
