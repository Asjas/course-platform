import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CTASection from "~/components/cta-section";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
  }) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock("~/components/ui/section", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="section">{children}</section>
  ),
}));

describe("CTASection", () => {
  it("renders the heading", () => {
    render(<CTASection />);
    expect(
      screen.getByRole("heading", {
        name: /ready to level up your skills/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the CTA button linking to signup", () => {
    render(<CTASection />);
    const link = screen.getByRole("link", { name: /try it free/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("renders the trust message", () => {
    render(<CTASection />);
    expect(
      screen.getByText(/cancel anytime.*30-day money-back guarantee/i),
    ).toBeInTheDocument();
  });

  it("renders description paragraphs", () => {
    render(<CTASection />);
    expect(screen.getByText(/create a free account/i)).toBeInTheDocument();
    expect(screen.getByText(/watch a few free modules/i)).toBeInTheDocument();
  });

  it("renders within a Section wrapper", () => {
    render(<CTASection />);
    expect(screen.getByTestId("section")).toBeInTheDocument();
  });
});
