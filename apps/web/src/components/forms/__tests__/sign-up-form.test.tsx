import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpForm from "~/components/forms/sign-up-form";
import { renderWithProviders } from "~/test-utils";

const { mockSignUpEmail, mockUseAuth } = vi.hoisted(() => ({
  mockSignUpEmail: vi.fn(),
  mockUseAuth: vi.fn(),
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
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  it("renders required fields and disabled submit when pristine", () => {
    renderWithProviders(<SignUpForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
  });

  it("submits sign-up data and navigates on success", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    mockSignUpEmail.mockResolvedValue({ error: null });

    const { router } = renderWithProviders(<SignUpForm />, {
      initialPath: "/signup",
    });

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.type(screen.getByLabelText("Confirm Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

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
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("shows error toast on sign-up failure", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    mockSignUpEmail.mockResolvedValue({ error: { message: "Email in use" } });

    const { router } = renderWithProviders(<SignUpForm />, {
      initialPath: "/signup",
    });

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.type(screen.getByLabelText("Confirm Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email in use");
    });

    expect(router.state.location.pathname).toBe("/signup");
  });
});
