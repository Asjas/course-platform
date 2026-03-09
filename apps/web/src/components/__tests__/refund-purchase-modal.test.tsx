import RefundPurchaseModal from "../refund-purchase-modal";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Purchase } from "~/lib/db.collections";
import { renderWithQueryClient } from "~/test-utils";

const { mockRefundMutate, mockInvalidateQueries, mockToast, mockQueryKey } =
  vi.hoisted(() => ({
    mockRefundMutate: vi.fn(),
    mockInvalidateQueries: vi.fn(),
    mockToast: {
      loading: vi.fn(() => "toast-id"),
      success: vi.fn(),
      error: vi.fn(),
    },
    mockQueryKey: vi.fn(() => ["purchases", "getAll"]),
  }));

vi.mock("~/lib/trpc.client", () => ({
  trpcClient: {
    purchases: {
      refund: {
        mutate: mockRefundMutate,
      },
    },
  },
  trpc: {
    purchases: {
      getAll: {
        queryKey: mockQueryKey,
      },
    },
  },
}));

vi.mock("~/lib/query.client", () => ({
  queryClient: {
    invalidateQueries: mockInvalidateQueries,
  },
}));

vi.mock("sonner", () => ({ toast: mockToast }));

function createPurchase(): Purchase {
  return {
    id: "order-1",
    totalAmount: 4999,
    refundedAmount: 0,
    currency: "usd",
    paid: true,
    createdAt: new Date("2026-03-09T10:00:00.000Z").toISOString(),
    product: { name: "Course One" },
    customer: {
      email: "student@example.com",
      name: "Student",
    },
  } as unknown as Purchase;
}

describe("RefundPurchaseModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryKey.mockReturnValue(["purchases", "getAll"]);
    mockToast.loading.mockReturnValue("toast-id");
  });

  it("renders nothing when purchase is null", () => {
    renderWithQueryClient(
      <RefundPurchaseModal
        purchase={null}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByText(/refund purchase/i)).not.toBeInTheDocument();
  });

  it("submits refund and closes modal on success", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockRefundMutate.mockResolvedValue({ success: true });

    renderWithQueryClient(
      <RefundPurchaseModal
        purchase={createPurchase()}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByText("USD 49.99")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText(/refund reason/i),
      "fraudulent",
    );
    await user.type(
      screen.getByLabelText(/internal comment/i),
      "Fraud check failed",
    );
    await user.click(screen.getByRole("button", { name: /confirm refund/i }));

    await waitFor(() => {
      expect(mockRefundMutate).toHaveBeenCalledWith({
        orderId: "order-1",
        reason: "fraudulent",
        comment: "Fraud check failed",
      });
    });
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["purchases", "getAll"],
      });
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "Refund processed successfully!",
      { id: "toast-id" },
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows error toast and keeps modal open on failure", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockRefundMutate.mockRejectedValue(new Error("api timeout"));

    renderWithQueryClient(
      <RefundPurchaseModal
        purchase={createPurchase()}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /confirm refund/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to process refund. Please try again.",
        { id: "toast-id" },
      );
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
