import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PricingSection from "~/components/pricing-section";
import { renderWithProviders } from "~/test-utils";

describe("PricingSection", () => {
  it("renders the pricing heading", () => {
    renderWithProviders(<PricingSection />);
    expect(
      screen.getByRole("heading", {
        name: /simple, transparent pricing/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders both free ($0) and paid ($19) price tiers", () => {
    renderWithProviders(<PricingSection />);
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("$19")).toBeInTheDocument();
  });

  it("renders 'Preview Course' and 'Full Course' tier names", () => {
    renderWithProviders(<PricingSection />);
    expect(
      screen.getByRole("heading", { name: /preview course/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /full course/i }),
    ).toBeInTheDocument();
  });

  it("renders a free call-to-action link to the signup page", () => {
    renderWithProviders(<PricingSection />);
    expect(screen.getByRole("link", { name: /free/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("renders a paid call-to-action link to the checkout page", () => {
    renderWithProviders(<PricingSection />);
    expect(
      screen.getByRole("link", { name: /buy full course/i }),
    ).toHaveAttribute("href", "/checkout");
  });

  it("lists feature items for each tier", () => {
    renderWithProviders(<PricingSection />);
    expect(
      screen.getAllByText(/stream and download/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/unlimited content updates/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders trust signals — cancel anytime, 30-day guarantee, and secure payment", () => {
    renderWithProviders(<PricingSection />);
    expect(screen.getByText(/cancel anytime/i)).toBeInTheDocument();
    expect(screen.getByText(/30-day guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/secure payment/i)).toBeInTheDocument();
  });
});
