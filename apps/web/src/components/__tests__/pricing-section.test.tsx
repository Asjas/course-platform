import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PricingSection from "~/components/pricing-section";

vi.mock("~/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardPrice: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-price">{children}</div>
  ),
  CardContentList: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="card-content-list">{children}</ul>
  ),
  CardContentListItem: ({
    children,
  }: {
    children: React.ReactNode;
    customClasses?: string;
  }) => <li data-testid="card-content-list-item">{children}</li>,
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-footer">{children}</div>
  ),
  CardAction: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a
      href={href}
      data-testid="card-action"
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

describe("PricingSection", () => {
  it("renders the pricing heading", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("heading", {
        name: /simple, transparent pricing/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders two pricing cards", () => {
    render(<PricingSection />);
    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(2);
  });

  it("renders free price ($0)", () => {
    render(<PricingSection />);
    const prices = screen.getAllByTestId("card-price");
    expect(prices[0]).toHaveTextContent("$0");
  });

  it("renders paid price ($19)", () => {
    render(<PricingSection />);
    const prices = screen.getAllByTestId("card-price");
    expect(prices[1]).toHaveTextContent("$19");
  });

  it("renders preview course header", () => {
    render(<PricingSection />);
    const headers = screen.getAllByTestId("card-header");
    expect(headers[0]).toHaveTextContent("Preview Course");
  });

  it("renders full course header", () => {
    render(<PricingSection />);
    const headers = screen.getAllByTestId("card-header");
    expect(headers[1]).toHaveTextContent("Full Course");
  });

  it("renders content list items", () => {
    render(<PricingSection />);
    const items = screen.getAllByTestId("card-content-list-item");
    expect(items.length).toBeGreaterThan(0);
  });

  it("renders trust signals section", () => {
    render(<PricingSection />);
    expect(screen.getByText(/cancel anytime/i)).toBeInTheDocument();
  });

  it("renders within a Section wrapper", () => {
    render(<PricingSection />);
    expect(screen.getByTestId("section")).toBeInTheDocument();
  });
});
