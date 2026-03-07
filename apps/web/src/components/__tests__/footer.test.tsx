import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Footer from "~/components/footer";

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

describe("Footer", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the copyright text", () => {
    render(<Footer />);
    expect(screen.getByText("© 2025")).toBeInTheDocument();
  });

  it("renders the brand name link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Codewizard Training" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the contact email link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {
      name: "contact@codewizard.training",
    });
    expect(link).toHaveAttribute("href", "mailto:contact@codewizard.training");
  });

  it("renders the uptime status link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Uptime Status" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Terms of Service link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Terms of Service" });
    expect(link).toHaveAttribute("href", "/terms");
  });

  it("renders Privacy Policy link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("renders Cookie Policy link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Cookie Policy" });
    expect(link).toHaveAttribute("href", "/cookies");
  });

  it("renders the builder attribution", () => {
    render(<Footer />);
    expect(screen.getByText(/Built with/)).toBeInTheDocument();
  });

  it("renders the typecraft inspiration link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "typecraft" });
    expect(link).toHaveAttribute("href", "https://typecraft.dev");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
