import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "~/components/ui/button";
import { renderWithProviders } from "~/test-utils";

describe("Button", () => {
  it("renders a default button and handles click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    await renderWithProviders(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies requested variant and size classes", async () => {
    await renderWithProviders(
      <Button
        variant="destructive"
        size="sm"
      >
        Delete
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("bg-destructive");
    expect(button).toHaveClass("h-8");
  });

  it("supports asChild composition", async () => {
    await renderWithProviders(
      <Button asChild>
        <a href="/docs">Read docs</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Read docs" })).toHaveAttribute(
      "href",
      "/docs",
    );
  });
});
