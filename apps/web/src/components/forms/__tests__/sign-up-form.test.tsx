import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpForm from "~/components/forms/sign-up-form";

const { mockNavigate, mockSignUpEmail, mockUseAuth } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignUpEmail: vi.fn(),
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
    signUp: {
      email: mockSignUpEmail,
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

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    });
  });

  it("renders required fields and disabled submit when pristine", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
  });

  it("submits sign-up data and navigates on success", async () => {
    const { toast } = await import("sonner");
    mockSignUpEmail.mockResolvedValue({ error: null });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secret123",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Signed up successfully!");
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });

  it("shows error toast on sign-up failure", async () => {
    const { toast } = await import("sonner");
    mockSignUpEmail.mockResolvedValue({ error: { message: "Email in use" } });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email in use");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
