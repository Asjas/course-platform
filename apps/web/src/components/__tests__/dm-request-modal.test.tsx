import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DMRequestModal } from "~/components/dm-request-modal";

const { mockMutate } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
}));

vi.mock("~/lib/trpc.client", () => ({
  trpcClient: {
    directMessages: {
      requestDM: { mutate: mockMutate },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => "toast-id"),
  },
}));

vi.mock("~/components/markdown-editor", () => ({
  GitHubMessageEditor: ({
    id,
    onChange,
    value,
    placeholder,
  }: {
    id: string;
    onChange: (v: string) => void;
    value: string;
    placeholder?: string;
  }) => (
    <textarea
      data-testid={id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      value={value}
    />
  ),
}));

describe("DMRequestModal", () => {
  it("renders the dialog title with the recipient name when open", async () => {
    render(
      <DMRequestModal
        isOpen={true}
        onClose={vi.fn()}
        recipientId="user-2"
        recipientName="Bob"
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: /request direct message with bob/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the explanation text mentioning the recipient name", async () => {
    render(
      <DMRequestModal
        isOpen={true}
        onClose={vi.fn()}
        recipientId="user-2"
        recipientName="Charlie"
      />,
    );

    expect(
      await screen.findByText(/why you'd like to message charlie/i),
    ).toBeInTheDocument();
  });

  it("Send Request button is disabled when the message field is empty", async () => {
    render(
      <DMRequestModal
        isOpen={true}
        onClose={vi.fn()}
        recipientId="user-2"
        recipientName="Dana"
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Send Request" }),
    ).toBeDisabled();
  });

  it("enables the Send Request button after typing a message", async () => {
    const user = userEvent.setup();

    render(
      <DMRequestModal
        isOpen={true}
        onClose={vi.fn()}
        recipientId="user-2"
        recipientName="Eve"
      />,
    );

    await user.type(
      screen.getByTestId("dm-request-message"),
      "I'd like to discuss the project.",
    );

    expect(screen.getByRole("button", { name: "Send Request" })).toBeEnabled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DMRequestModal
        isOpen={true}
        onClose={onClose}
        recipientId="user-2"
        recipientName="Frank"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});
