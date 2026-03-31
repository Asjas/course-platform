import NewSupportTicketForm from "../create-support-ticket-form";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "~/test-utils";

const { mockCollection, mockToast } = vi.hoisted(() => ({
  mockCollection: {
    insert: vi.fn(() => ({ isPersisted: { promise: Promise.resolve() } })),
    utils: { refetch: vi.fn(() => Promise.resolve()) },
  },
  mockToast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock("~/collections/support-tickets", () => ({
  SupportTicketsCollection: mockCollection,
}));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("~/components/blocker", () => ({ default: () => null }));
vi.mock("~/components/markdown-editor", () => ({
  GitHubMessageEditor: ({
    value,
    onChange,
    id,
  }: {
    value: string;
    onChange: (v: string) => void;
    id: string;
  }) => (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="description-editor"
    />
  ),
}));

describe("NewSupportTicketForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields and submit button is disabled when pristine", async () => {
    await renderWithProviders(<NewSupportTicketForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /repository url/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("successfully creates support ticket and navigates to ticket page", async () => {
    const user = userEvent.setup();
    mockCollection.insert.mockReturnValue({
      isPersisted: { promise: Promise.resolve() },
    });
    mockCollection.utils.refetch.mockResolvedValue(undefined);

    const { router } = await renderWithProviders(<NewSupportTicketForm />, {
      initialPath: "/support/new",
    });

    await user.type(screen.getByLabelText(/title/i), "Test Issue");
    await user.type(
      screen.getByRole("textbox", { name: /repository url/i }),
      "https://github.com/test/repo",
    );
    await user.type(
      screen.getByTestId("description-editor"),
      "This is a test issue description",
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCollection.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Issue",
          repo: "https://github.com/test/repo",
        }),
      );
    });
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Support ticket created successfully!",
      );
    });
    await waitFor(() => {
      // TanStack Router URL-encodes ":" as "%3A" in the pathname
      expect(router.state.location.pathname).toMatch(/^\/support\/suptick/);
    });
  });

  it("displays error toast when support ticket creation fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    mockCollection.insert.mockImplementation(() => {
      throw new Error("Database error");
    });

    const { router } = await renderWithProviders(<NewSupportTicketForm />, {
      initialPath: "/support/new",
    });

    await user.type(screen.getByLabelText(/title/i), "Test Issue");
    await user.type(
      screen.getByRole("textbox", { name: /repository url/i }),
      "https://github.com/test/repo",
    );
    await user.type(
      screen.getByTestId("description-editor"),
      "This is a test issue description",
    );
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "An error occurred while creating the support ticket. Please try again.",
      );
    });
    expect(router.state.location.pathname).toBe("/support/new");
  });
});
