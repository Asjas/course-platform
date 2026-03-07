import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "~/components/theme-toggle";

const mockSetTheme = vi.fn();

vi.mock("~/lib/theme.context", () => ({
  useTheme: () => ({
    theme: "system",
    resolvedTheme: "light",
    setTheme: mockSetTheme,
  }),
}));

vi.mock("react-aria-components", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
  MenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("~/components/ui/menu", () => ({
  Menu: ({ children }: { children: React.ReactNode }) => (
    <ul role="menu">{children}</ul>
  ),
  MenuItem: ({
    children,
    onAction,
  }: {
    children: React.ReactNode;
    onAction?: () => void;
    isSelected?: boolean;
  }) => (
    <li
      role="menuitem"
      onClick={onAction}
      onKeyDown={(e) => {
        if (e.key === "Enter") onAction?.();
      }}
    >
      {children}
    </li>
  ),
  MenuPopover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("lucide-react", () => ({
  SunIcon: (props: Record<string, unknown>) => (
    <svg
      data-testid="sun-icon"
      {...props}
    />
  ),
  MoonIcon: (props: Record<string, unknown>) => (
    <svg
      data-testid="moon-icon"
      {...props}
    />
  ),
  MonitorIcon: (props: Record<string, unknown>) => (
    <svg
      data-testid="monitor-icon"
      {...props}
    />
  ),
}));

describe("ThemeToggle", () => {
  it("renders a toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has accessible label with current theme", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Change theme. Current theme: system",
    );
  });

  it("renders the sun icon when resolved theme is light", () => {
    render(<ThemeToggle />);
    expect(screen.getAllByTestId("sun-icon").length).toBeGreaterThan(0);
  });

  it("renders theme menu options", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders a menu", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders menu items", () => {
    render(<ThemeToggle />);
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(3);
  });
});
