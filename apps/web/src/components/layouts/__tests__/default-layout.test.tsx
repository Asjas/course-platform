import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DefaultLayoutComponent from "~/components/layouts/default-layout";
import { renderWithProviders } from "~/test-utils";

const { mockUseAuth, mockSendVerificationEmail, mockToast } = vi.hoisted(
  () => ({
    mockUseAuth: vi.fn(),
    mockSendVerificationEmail: vi.fn(),
    mockToast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
);

vi.mock("~/components/header", () => ({
  default: () => <div>Header shell</div>,
}));

vi.mock("~/components/footer", () => ({
  default: () => <div>Footer shell</div>,
}));

vi.mock("~/components/ui/sonner", () => ({
  Toaster: () => <div>Toaster mount</div>,
}));

vi.mock("@tanstack/react-devtools", () => ({
  TanStackDevtools: () => null,
}));

vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtoolsPanel: () => null,
}));

vi.mock("@tanstack/react-router-devtools", () => ({
  TanStackRouterDevtoolsPanel: () => null,
}));

vi.mock("@tanstack/react-form-devtools", () => ({
  FormDevtoolsPanel: () => null,
}));

vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: {
    sendVerificationEmail: mockSendVerificationEmail,
  },
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

describe("DefaultLayoutComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skip link, header/footer shells, and children", async () => {
    mockUseAuth.mockReturnValue({
      session: null,
    });

    await renderWithProviders(
      <DefaultLayoutComponent>
        <main>Child content</main>
      </DefaultLayoutComponent>,
    );

    expect(screen.getByRole("link", { name: "Skip to main" })).toHaveAttribute(
      "href",
      "#maincontent",
    );
    expect(screen.getByText("Header shell")).toBeInTheDocument();
    expect(screen.getByText("Footer shell")).toBeInTheDocument();
    expect(screen.getByText("Toaster mount")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("shows email verification banner and handles successful resend", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      session: {
        user: {
          email: "pending@example.com",
          emailVerified: false,
        },
      },
    });

    mockSendVerificationEmail.mockImplementation(
      (
        _args: unknown,
        callbacks: { onSuccess?: () => void; onError?: () => void },
      ) => {
        callbacks.onSuccess?.();
      },
    );

    await renderWithProviders(
      <DefaultLayoutComponent>
        <div>Body</div>
      </DefaultLayoutComponent>,
    );

    expect(screen.getByText(/Your email is not verified/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Resend Verification Email" }),
    );

    await waitFor(() => {
      expect(mockSendVerificationEmail).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Verification email resent!",
      );
    });

    expect(
      screen.getByRole("button", { name: "Verification Email Sent!" }),
    ).toBeInTheDocument();
  });

  it("shows error toast when resend callback returns an error", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      session: {
        user: {
          email: "pending@example.com",
          emailVerified: false,
        },
      },
    });

    mockSendVerificationEmail.mockImplementation(
      (
        _args: unknown,
        callbacks: {
          onSuccess?: () => void;
          onError?: (payload: { error: Error }) => void;
        },
      ) => {
        callbacks.onError?.({ error: new Error("network") });
      },
    );

    await renderWithProviders(
      <DefaultLayoutComponent>
        <div>Body</div>
      </DefaultLayoutComponent>,
    );

    await user.click(
      screen.getByRole("button", { name: "Resend Verification Email" }),
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to resend verification email.",
      );
    });

    expect(
      screen.getByRole("button", { name: "Resend Verification Email" }),
    ).toBeInTheDocument();
  });
});
