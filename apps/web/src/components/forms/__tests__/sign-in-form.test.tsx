import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInForm from "~/components/forms/sign-in-form";

const { mockNavigate, mockSignInEmail, mockUseAuth } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignInEmail: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Block: ({ children }: { children: (args: { status: string }) => unknown }) =>
    children({ status: "unblocked" }),
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
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    });
  });

  it("renders fields and keeps submit disabled while pristine", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Remember Me")).toBeChecked();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
  });

  it("submits credentials and navigates on success", async () => {
    const { toast } = await import("sonner");
    mockSignInEmail.mockResolvedValue({ error: null });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

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
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });

  it("shows error toast and does not navigate on failure", async () => {
    const { toast } = await import("sonner");
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
