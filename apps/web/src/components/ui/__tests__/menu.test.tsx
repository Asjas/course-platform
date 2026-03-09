import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu, MenuItem } from "~/components/ui/menu";

describe("Menu components", () => {
  describe("Menu", () => {
    it("renders menu with items", () => {
      render(
        <Menu aria-label="Test menu">
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </Menu>,
      );

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });

    it("applies custom className to menu", () => {
      const { container } = render(
        <Menu
          className="custom-menu"
          aria-label="Test menu"
        >
          <MenuItem>Item</MenuItem>
        </Menu>,
      );

      const menu = container.querySelector(".custom-menu");
      expect(menu).toBeInTheDocument();
    });
  });

  describe("MenuItem", () => {
    it("renders menu item with children", () => {
      render(
        <Menu aria-label="Test menu">
          <MenuItem>Click me</MenuItem>
        </Menu>,
      );

      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("triggers onAction when clicked", async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(
        <Menu
          aria-label="Actions"
          onAction={handleAction}
        >
          <MenuItem id="save">Save</MenuItem>
        </Menu>,
      );

      await user.click(screen.getByText("Save"));

      expect(handleAction).toHaveBeenCalledWith("save");
    });

    it("applies isSelected styling", () => {
      render(
        <Menu aria-label="View">
          <MenuItem isSelected>Selected Item</MenuItem>
          <MenuItem>Regular Item</MenuItem>
        </Menu>,
      );

      const selectedItem = screen.getByText("Selected Item");
      expect(selectedItem).toHaveClass("bg-gray-100");
    });
  });
});
