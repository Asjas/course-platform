import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ViewPurchaseSheet from "~/components/view-purchase-sheet";
import type { Purchase } from "~/lib/db.collections";

vi.mock("~/lib/db.collections", () => ({}));

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: "purchase-1",
    totalAmount: 9900,
    taxAmount: 900,
    refundedAmount: 0,
    currency: "usd",
    paid: true,
    status: "completed",
    billingReason: "purchase",
    description: "Full course access",
    invoiceNumber: "INV-001",
    checkoutId: "chk-123",
    createdAt: "2026-01-15T10:00:00Z",
    modifiedAt: null,
    product: {
      name: "Learn TypeScript",
      description: "Complete TS course",
      isRecurring: false,
    },
    customer: {
      name: "Alice Smith",
      email: "alice@example.com",
    },
    ...overrides,
  } as Purchase;
}

describe("ViewPurchaseSheet", () => {
  it("renders nothing when purchase is null", () => {
    const { container } = render(
      <ViewPurchaseSheet
        purchase={null}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("displays the purchase title and order date", () => {
    render(
      <ViewPurchaseSheet
        purchase={makePurchase()}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Purchase Details" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/order placed on/i)).toBeInTheDocument();
  });

  it("shows 'Paid' status badge for paid purchases", () => {
    render(
      <ViewPurchaseSheet
        purchase={makePurchase({ paid: true, refundedAmount: 0 })}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("shows 'Refunded' status badge when refundedAmount is greater than zero", () => {
    render(
      <ViewPurchaseSheet
        purchase={makePurchase({ refundedAmount: 4900 })}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Refunded")).toHaveLength(2);
    expect(screen.getByText(/49\.00/)).toBeInTheDocument();
  });

  it("calls onOpenChange when the Close button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ViewPurchaseSheet
        purchase={makePurchase()}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    await user.click(closeButtons[closeButtons.length - 1]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
