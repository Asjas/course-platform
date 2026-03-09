import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { renderWithProviders } from "~/test-utils";

describe("Sheet", () => {
  it("opens from trigger and closes using built-in close button", async () => {
    const user = userEvent.setup();

    await renderWithProviders(
      <Sheet>
        <SheetTrigger>Open panel</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel title</SheetTitle>
            <SheetDescription>Panel details</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByRole("button", { name: "Open panel" }));
    expect(screen.getByText("Panel title")).toBeInTheDocument();
    expect(screen.getByText("Panel details")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Panel title")).toBeNull();
  });
});
