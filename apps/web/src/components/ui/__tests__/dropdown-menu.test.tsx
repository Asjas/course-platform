import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { renderWithProviders } from "~/test-utils";

describe("DropdownMenu", () => {
  it("opens and executes an item action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    await renderWithProviders(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onAction}>Edit item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit item" }),
    );

    expect(onAction).toHaveBeenCalled();
  });

  it("renders label, separator, checkbox and radio options", async () => {
    const user = userEvent.setup();

    await renderWithProviders(
      <DropdownMenu>
        <DropdownMenuTrigger>Open options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>
            Enable alerts
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="light">
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Open options" }));

    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Enable alerts" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "Light" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});
