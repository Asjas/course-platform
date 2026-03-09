import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Section from "~/components/ui/section";
import { renderWithProviders } from "~/test-utils";

describe("Section", () => {
  it("renders semantic section container with children", async () => {
    await renderWithProviders(
      <Section>
        <h2>Overview</h2>
      </Section>,
    );

    const heading = screen.getByRole("heading", { name: "Overview" });
    expect(heading).toBeInTheDocument();
    expect(heading.closest("section")).not.toBeNull();
  });
});
