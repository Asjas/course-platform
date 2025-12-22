import { useCallback, useEffect, useMemo, useState } from "react";
import { type Theme, ThemeContext, type ThemeState } from "~/lib/theme.context";

const THEME_STORAGE_KEY = "theme-preference";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolvedTheme: "light" | "dark") {
  const root = document.documentElement;

  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Update color-scheme for native elements (scrollbars, form controls, etc.)
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  // Track system preference changes for reactive updates
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() =>
    getSystemTheme(),
  );

  // Compute resolved theme from current theme and system preference
  const resolvedTheme = useMemo<"light" | "dark">(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(e: MediaQueryListEvent) {
      setSystemTheme(e.matches ? "dark" : "light");
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme when resolved theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value: ThemeState = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
