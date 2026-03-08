import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CTASection from "~/components/cta-section";
import { renderWithProviders } from "~/test-utils";

describe("CTASection", () => {
  it("renders the heading", async () => {
    await renderWithProviders(<CTASection />);
    expect(
      screen.getByRole("heading", {
        name: /ready to level up your skills/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the CTA button linking to signup", async () => {
    await renderWithProviders(<CTASection />);
    const link = screen.getByRole("link", { name: /try it free/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("renders the trust message", async () => {
    await renderWithProviders(<CTASection />);
    expect(
      screen.getByText(/cancel anytime.*30-day money-back guarantee/i),
    ).toBeInTheDocument();
  });

  it("renders description paragraphs", async () => {
    await renderWithProviders(<CTASection />);
    expect(screen.getByText(/create a free account/i)).toBeInTheDocument();
    expect(screen.getByText(/watch a few free modules/i)).toBeInTheDocument();
  });
});
