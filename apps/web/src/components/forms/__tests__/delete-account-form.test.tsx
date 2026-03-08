import DeleteAccountForm from "../delete-account-form";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "~/test-utils";

const { mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockAuthClient: { deleteUser: vi.fn() },
  mockToast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() },
}));

vi.mock("~/lib/auth.client", () => ({ authClient: mockAuthClient }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("~/components/blocker", () => ({ default: () => null }));

describe("DeleteAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders password field and keeps delete disabled while pristine", () => {
    renderWithProviders(<DeleteAccountForm />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete account/i }),
    ).toBeDisabled();
  });

  it("deletes account and navigates home on success", async () => {
    const user = userEvent.setup();
    mockAuthClient.deleteUser.mockResolvedValue({ error: null });

    const { router } = renderWithProviders(<DeleteAccountForm />, {
      initialPath: "/settings",
    });

    await user.type(screen.getByLabelText(/current password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    await waitFor(() => {
      expect(mockAuthClient.deleteUser).toHaveBeenCalledWith({
        password: "Password123!",
      });
    });
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Account deleted successfully!",
      );
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });

  it("shows error toast and does not navigate on failure", async () => {
    const user = userEvent.setup();
    mockAuthClient.deleteUser.mockResolvedValue({
      error: { message: "Incorrect password" },
    });

    const { router } = renderWithProviders(<DeleteAccountForm />, {
      initialPath: "/settings",
    });

    await user.type(screen.getByLabelText(/current password/i), "bad-pass");
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Incorrect password");
    });
    expect(router.state.location.pathname).toBe("/settings");
  });

  it("uses fallback error message when delete response has no message", async () => {
    const user = userEvent.setup();
    mockAuthClient.deleteUser.mockResolvedValue({ error: { message: "" } });

    const { router } = renderWithProviders(<DeleteAccountForm />, {
      initialPath: "/settings",
    });

    await user.type(screen.getByLabelText(/current password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to delete account");
    });
    expect(router.state.location.pathname).toBe("/settings");
  });

  it("resets the form when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeleteAccountForm />);

    const passwordInput = screen.getByLabelText(/current password/i);
    await user.type(passwordInput, "Password123!");
    expect(
      screen.getByRole("button", { name: /delete account/i }),
    ).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(passwordInput).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /delete account/i }),
    ).toBeDisabled();
  });
});
