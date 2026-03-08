import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInForm from "~/components/forms/sign-in-form";
import { renderWithProviders } from "~/test-utils";

const { mockSignInEmail, mockUseAuth } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
    },
  },
}));

vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  it("renders fields and keeps submit disabled while pristine", async () => {
    await renderWithProviders(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Remember Me")).toBeChecked();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
  });

  it("submits credentials and navigates on success", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    mockSignInEmail.mockResolvedValue({ error: null });

    const { router } = await renderWithProviders(<SignInForm />, {
      initialPath: "/signin",
    });

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "secret123",
        rememberMe: true,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Signed in successfully!");
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("shows error toast and does not navigate on failure", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    const { router } = await renderWithProviders(<SignInForm />, {
      initialPath: "/signin",
    });

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(router.state.location.pathname).toBe("/signin");
  });
});
