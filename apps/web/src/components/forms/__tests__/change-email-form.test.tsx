import ChangeEmailForm from "../change-email-form";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const { mockAuthClient, mockUseAuth, mockToast } = vi.hoisted(() => ({
  mockAuthClient: {
    changeEmail: vi.fn(),
  },
  mockUseAuth: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock auth client
vi.mock("~/lib/auth.client", () => ({
  authClient: mockAuthClient,
}));

// Mock auth context
vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: mockToast,
}));

// Mock blocker component
vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

describe("ChangeEmailForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          id: "user123",
          email: "current@example.com",
          name: "Test User",
        },
      },
    });
  });

  it("renders new email field and displays current email", () => {
    render(<ChangeEmailForm />);

    expect(screen.getByText(/current@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new email/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it("successfully changes email and displays success message", async () => {
    const user = userEvent.setup();

    mockAuthClient.changeEmail.mockResolvedValue({ error: null });

    render(<ChangeEmailForm />);

    // Fill in new email
    await user.type(screen.getByLabelText(/new email/i), "new@example.com");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // Wait for auth client call
    await waitFor(() => {
      expect(mockAuthClient.changeEmail).toHaveBeenCalledWith({
        newEmail: "new@example.com",
      });
    });

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Email change requested! Please check your inbox.",
      );
    });
  });

  it("displays error toast when email change fails", async () => {
    const user = userEvent.setup();

    mockAuthClient.changeEmail.mockResolvedValue({
      error: { message: "Email already in use" },
    });

    render(<ChangeEmailForm />);

    // Fill in new email
    await user.type(
      screen.getByLabelText(/new email/i),
      "existing@example.com",
    );

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    // Wait for error toast
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Email already in use");
    });
  });
});
