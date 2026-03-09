import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavLink } from "~/components/ui/nav-link";
import { renderWithProviders } from "~/test-utils";

describe("NavLink", () => {
  it("renders as a link with provided destination", async () => {
    await renderWithProviders(<NavLink to="/support">Support</NavLink>);

    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      "/support",
    );
  });

  it("applies custom classes alongside base styles", async () => {
    await renderWithProviders(
      <NavLink
        className="custom-class"
        to="/"
      >
        Home
      </NavLink>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveClass(
      "custom-class",
    );
  });
});
