import RequestPasswordResetForm from "../request-password-reset-form";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockAuthClient: {
    requestPasswordReset: vi.fn(),
  },
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: mockAuthClient,
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

describe("RequestPasswordResetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email field and keeps submit disabled while pristine", () => {
    render(<RequestPasswordResetForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeDisabled();
  });

  it("requests password reset and shows success toast", async () => {
    const user = userEvent.setup();
    mockAuthClient.requestPasswordReset.mockResolvedValue({ error: null });

    render(<RequestPasswordResetForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockAuthClient.requestPasswordReset).toHaveBeenCalledWith({
        email: "user@example.com",
      });
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password reset link sent! Please check your inbox.",
      );
    });
  });

  it("shows error toast when request fails", async () => {
    const user = userEvent.setup();
    mockAuthClient.requestPasswordReset.mockResolvedValue({
      error: { message: "User not found" },
    });

    render(<RequestPasswordResetForm />);

    await user.type(screen.getByLabelText(/email/i), "missing@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("User not found");
    });
  });

  it("uses fallback error message when request response has no message", async () => {
    const user = userEvent.setup();
    mockAuthClient.requestPasswordReset.mockResolvedValue({
      error: { message: "" },
    });

    render(<RequestPasswordResetForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to request password reset",
      );
    });
  });

  it("does not submit when email is invalid", async () => {
    const user = userEvent.setup();

    render(<RequestPasswordResetForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockAuthClient.requestPasswordReset).not.toHaveBeenCalled();
    });
  });
});
