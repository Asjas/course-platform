import PasswordResetForm from "../password-reset-form";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "~/test-utils";

const { mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockAuthClient: { resetPassword: vi.fn() },
  mockToast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock("~/lib/auth.client", () => ({ authClient: mockAuthClient }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("~/components/blocker", () => ({ default: () => null }));

describe("PasswordResetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fields and keeps submit disabled while pristine", () => {
    renderWithProviders(<PasswordResetForm token="token-123" />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeDisabled();
  });

  it("resets password and navigates to signin on success", async () => {
    const user = userEvent.setup();
    mockAuthClient.resetPassword.mockResolvedValue({ error: null });

    renderWithProviders(
      <PasswordResetForm token="token-abc" />,
      { initialPath: "/reset-password" },
    );

    await user.type(screen.getByLabelText(/new password/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
        newPassword: "Password123!",
        token: "token-abc",
      });
    });
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password reset successfully!",
      );
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/signin");
    });
  });

  it("shows error toast and does not navigate on failure", async () => {
    const user = userEvent.setup();
    mockAuthClient.resetPassword.mockResolvedValue({
      error: { message: "Invalid token" },
    });

    renderWithProviders(
      <PasswordResetForm token="bad-token" />,
      { initialPath: "/reset-password" },
    );

    await user.type(screen.getByLabelText(/new password/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Invalid token");
    });
    expect(router.state.location.pathname).toBe("/reset-password");
  });

  it("uses fallback error message when reset response has no message", async () => {
    const user = userEvent.setup();
    mockAuthClient.resetPassword.mockResolvedValue({ error: { message: "" } });

    renderWithProviders(
      <PasswordResetForm token="token-empty" />,
      { initialPath: "/reset-password" },
    );

    await user.type(screen.getByLabelText(/new password/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to reset password");
    });
  });

  it("does not submit when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PasswordResetForm token="token-mismatch" />);

    await user.type(screen.getByLabelText(/new password/i), "Password123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "Password123?X",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockAuthClient.resetPassword).not.toHaveBeenCalled();
    });
  });
});
