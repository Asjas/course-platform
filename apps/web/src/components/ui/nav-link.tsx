import { createLink } from "@tanstack/react-router";
import { type LinkProps, Link as RACLink } from "react-aria-components";
import { cn } from "~/lib/utils";

function CustomLink(props: LinkProps) {
  return (
    <RACLink
      {...props}
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-1.5 text-sm leading-6 font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
        props.className,
      )}
    >
      {props.children}
    </RACLink>
  );
}

export const NavLink = createLink(CustomLink);
export const Link = createLink(RACLink);
