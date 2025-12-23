import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button as AriaButton, MenuTrigger } from "react-aria-components";
import { Menu, MenuItem, MenuPopover } from "~/components/ui/menu";
import { type Theme, useTheme } from "~/lib/theme.context";

const themeOptions: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const CurrentIcon = resolvedTheme === "dark" ? MoonIcon : SunIcon;

  return (
    <MenuTrigger>
      <AriaButton
        className="flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label={`Change theme. Current theme: ${theme}`}
      >
        <CurrentIcon
          className="size-6"
          aria-hidden="true"
        />
      </AriaButton>

      <MenuPopover>
        <Menu>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <MenuItem
                key={option.value}
                isSelected={isSelected}
                onAction={() => setTheme(option.value)}
              >
                <Icon
                  className="size-4"
                  aria-hidden="true"
                />
                <span>{option.label}</span>
                {isSelected && (
                  <span
                    className="ml-auto text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </MenuItem>
            );
          })}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}
