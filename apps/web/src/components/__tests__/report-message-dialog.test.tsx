import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportMessageDialog } from "~/components/report-message-dialog";
import { renderWithQueryClient } from "~/test-utils";

const { mockToast } = vi.hoisted(() => ({
  mockToast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("~/lib/trpc.client", () => ({
  trpcClient: {
    chatReports: {
      reportMessage: { mutate: vi.fn().mockResolvedValue(undefined) },
    },
  },
}));

vi.mock("sonner", () => ({ toast: mockToast }));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  messageId: "msg-1",
  channelId: "chan-1",
  messageContent: "This is a bad message",
  messageAuthor: "baduser",
};

describe("ReportMessageDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    renderWithQueryClient(
      <ReportMessageDialog
        {...defaultProps}
        isOpen={false}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog with all report reasons, a details textarea, and action buttons when open", () => {
    renderWithQueryClient(<ReportMessageDialog {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Report Message" }),
    ).toBeInTheDocument();

    expect(screen.getByText("This is a bad message")).toBeInTheDocument();

    for (const label of [
      "Spam",
      "Harassment",
      "Inappropriate",
      "Offensive",
      "Violence",
      "Illegal Activity",
      "Other",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    expect(
      screen.getByRole("textbox", { name: /additional details/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Report Message" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithQueryClient(
      <ReportMessageDialog
        {...defaultProps}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("submits the form by calling trpcClient.chatReports.reportMessage.mutate when Report Message is clicked", async () => {
    const user = userEvent.setup();
    const { trpcClient } = await import("~/lib/trpc.client");

    renderWithQueryClient(<ReportMessageDialog {...defaultProps} />);

    await user.type(
      screen.getByRole("textbox", { name: /additional details/i }),
      "More context",
    );
    await user.click(screen.getByRole("button", { name: "Report Message" }));

    await waitFor(() => {
      expect(
        trpcClient.chatReports.reportMessage.mutate,
      ).toHaveBeenCalledOnce();
    });
  });

  it("shows 'Reporting...' and disables buttons while the mutation is pending", async () => {
    const user = userEvent.setup();
    const { trpcClient } = await import("~/lib/trpc.client");
    vi.mocked(trpcClient.chatReports.reportMessage.mutate).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}),
    );

    renderWithQueryClient(<ReportMessageDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Report Message" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Reporting..." }),
      ).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
