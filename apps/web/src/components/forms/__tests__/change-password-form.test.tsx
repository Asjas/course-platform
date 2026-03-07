import ChangePasswordForm from "../change-password-form";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const { mockNavigate, mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAuthClient: {
    changePassword: vi.fn(),
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

// Mock auth client
vi.mock("~/lib/auth.client", () => ({
  authClient: mockAuthClient,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: mockToast,
}));

// Mock blocker component
vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields and submit button is disabled when pristine", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it("successfully changes password and navigates to signin", async () => {
    const user = userEvent.setup();

    mockAuthClient.changePassword.mockResolvedValue({ error: null });

    render(<ChangePasswordForm />);

    // Fill in form fields
    await user.type(
      screen.getByLabelText(/current password/i),
      "oldpassword123",
    );
    await user.type(screen.getByLabelText(/new password/i), "newpassword456");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // Wait for auth client call
    await waitFor(() => {
      expect(mockAuthClient.changePassword).toHaveBeenCalledWith({
        currentPassword: "oldpassword123",
        newPassword: "newpassword456",
        revokeOtherSessions: true,
      });
    });

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password changed successfully!",
      );
    });

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/signin",
        replace: true,
      });
    });
  });

  it("displays error toast when password change fails", async () => {
    const user = userEvent.setup();

    mockAuthClient.changePassword.mockResolvedValue({
      error: { message: "Current password is incorrect" },
    });

    render(<ChangePasswordForm />);

    // Fill in form fields
    await user.type(
      screen.getByLabelText(/current password/i),
      "wrongpassword",
    );
    await user.type(screen.getByLabelText(/new password/i), "newpassword456");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    // Wait for error toast
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Current password is incorrect",
      );
    });

    // Navigation should not be called on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
