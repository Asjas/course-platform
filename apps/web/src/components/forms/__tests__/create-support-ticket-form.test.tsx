import NewSupportTicketForm from "../create-support-ticket-form";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const { mockNavigate, mockCollection, mockToast } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockCollection: {
    insert: vi.fn(() => ({
      isPersisted: { promise: Promise.resolve() },
    })),
    utils: {
      refetch: vi.fn(() => Promise.resolve()),
    },
  },
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock SupportTicketsCollection
vi.mock("~/lib/db.collections", () => ({
  SupportTicketsCollection: mockCollection,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: mockToast,
}));

// Mock blocker component
vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

// Mock markdown editor
vi.mock("~/components/markdown-editor", () => ({
  GitHubMessageEditor: ({
    value,
    onChange,
    id,
  }: {
    value: string;
    onChange: (value: string) => void;
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

  it("renders all required fields and submit button is disabled when pristine", () => {
    render(<NewSupportTicketForm />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /repository url/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it("successfully creates support ticket and navigates to ticket page", async () => {
    const user = userEvent.setup();

    mockCollection.insert.mockReturnValue({
      isPersisted: { promise: Promise.resolve() },
    });
    mockCollection.utils.refetch.mockResolvedValue(undefined);

    render(<NewSupportTicketForm />);

    // Fill in form fields
    await user.type(screen.getByLabelText(/title/i), "Test Issue");
    await user.type(
      screen.getByRole("textbox", { name: /repository url/i }),
      "https://github.com/test/repo",
    );
    await user.type(
      screen.getByTestId("description-editor"),
      "This is a test issue description",
    );

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(mockCollection.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Issue",
          repo: "https://github.com/test/repo",
          description: "This is a test issue description",
        }),
      );
    });

    await waitFor(() => {
      expect(mockCollection.utils.refetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Support ticket created successfully!",
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "/support/$supportTicket",
          params: expect.objectContaining({
            supportTicket: expect.stringMatching(/^suptick:/),
          }),
        }),
      );
    });
  });

  it("displays error toast when support ticket creation fails", async () => {
    const user = userEvent.setup();

    mockCollection.insert.mockImplementation(() => {
      throw new Error("Database error");
    });

    render(<NewSupportTicketForm />);

    // Fill in form fields
    await user.type(screen.getByLabelText(/title/i), "Test Issue");
    await user.type(
      screen.getByRole("textbox", { name: /repository url/i }),
      "https://github.com/test/repo",
    );
    await user.type(
      screen.getByTestId("description-editor"),
      "This is a test issue description",
    );

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    // Wait for error toast
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "An error occurred while creating the support ticket. Please try again.",
      );
    });

    // Navigation should not be called on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
