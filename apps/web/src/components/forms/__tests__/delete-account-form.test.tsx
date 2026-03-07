import DeleteAccountForm from "../delete-account-form";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate, mockAuthClient, mockToast } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAuthClient: {
    deleteUser: vi.fn(),
  },
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
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

describe("DeleteAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders password field and keeps delete disabled while pristine", () => {
    render(<DeleteAccountForm />);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete account/i }),
    ).toBeDisabled();
  });

  it("deletes account and navigates home on success", async () => {
    const user = userEvent.setup();
    mockAuthClient.deleteUser.mockResolvedValue({ error: null });

    render(<DeleteAccountForm />);

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
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/", replace: true });
    });
  });

  it("shows error toast and does not navigate on failure", async () => {
    const user = userEvent.setup();
    mockAuthClient.deleteUser.mockResolvedValue({
      error: { message: "Incorrect password" },
    });

    render(<DeleteAccountForm />);

    await user.type(screen.getByLabelText(/current password/i), "bad-pass");
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Incorrect password");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
