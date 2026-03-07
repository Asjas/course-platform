import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotFoundComponent from "~/components/not-found";

vi.mock("~/components/ui/nav-link", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a
      className={className}
      href={to}
    >
      {children}
    </a>
  ),
}));

describe("NotFoundComponent", () => {
  it("renders page not found text", () => {
    render(<NotFoundComponent />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("renders a link to the home page", () => {
    render(<NotFoundComponent />);
    const link = screen.getByRole("link", { name: "Go to home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
