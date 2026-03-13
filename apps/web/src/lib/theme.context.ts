import { createContext, useContext } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

export const defaultThemeState: ThemeState = {
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => undefined,
};

export const ThemeContext = createContext<ThemeState>(defaultThemeState);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
