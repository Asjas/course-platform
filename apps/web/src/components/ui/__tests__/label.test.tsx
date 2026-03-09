import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "~/components/ui/label";
import { renderWithProviders } from "~/test-utils";

describe("Label", () => {
  it("associates label text with the target control via htmlFor", async () => {
    await renderWithProviders(
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input
          id="email"
          type="text"
        />
      </div>,
    );

    expect(screen.getByText("Email Address")).toHaveAttribute("for", "email");
  });
});
