import ChangePasswordForm from "../change-password-form";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "~/test-utils";

const { mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockAuthClient: { changePassword: vi.fn() },
  mockToast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock("~/lib/auth.client", () => ({ authClient: mockAuthClient }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("~/components/blocker", () => ({ default: () => null }));

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields and submit button is disabled when pristine", () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("successfully changes password and navigates to signin", async () => {
    const user = userEvent.setup();
    mockAuthClient.changePassword.mockResolvedValue({ error: null });

    const { router } = renderWithProviders(<ChangePasswordForm />, {
      initialPath: "/settings",
    });

    await user.type(
      screen.getByLabelText(/current password/i),
      "oldpassword123",
    );
    await user.type(screen.getByLabelText(/new password/i), "newpassword456");

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthClient.changePassword).toHaveBeenCalledWith({
        currentPassword: "oldpassword123",
        newPassword: "newpassword456",
        revokeOtherSessions: true,
      });
    });
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password changed successfully!",
      );
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/signin");
    });
  });

  it("displays error toast when password change fails", async () => {
    const user = userEvent.setup();
    mockAuthClient.changePassword.mockResolvedValue({
      error: { message: "Current password is incorrect" },
    });

    const { router } = renderWithProviders(<ChangePasswordForm />, {
      initialPath: "/settings",
    });

    await user.type(
      screen.getByLabelText(/current password/i),
      "wrongpassword",
    );
    await user.type(screen.getByLabelText(/new password/i), "newpassword456");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Current password is incorrect",
      );
    });
    expect(router.state.location.pathname).toBe("/settings");
  });
});
