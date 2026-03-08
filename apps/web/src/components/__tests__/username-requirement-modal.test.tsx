import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsernameRequirementModal } from "~/components/username-requirement-modal";
import { renderWithProviders } from "~/test-utils";

const { mockUpdateUser, mockToast } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockToast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: {
    updateUser: mockUpdateUser,
  },
}));

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("~/components/field-info", () => ({
  default: () => null,
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("UsernameRequirementModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    renderWithProviders(
      <UsernameRequirementModal
        {...defaultProps}
        isOpen={false}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, username input, Set Username button, Leave Chat button when open", () => {
    renderWithProviders(<UsernameRequirementModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: /username required for chat/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /choose a username/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /set username & join chat/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /leave chat/i }),
    ).toBeInTheDocument();
  });

  it("clicking Leave Chat navigates to /dashboard", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { router } = renderWithProviders(
      <UsernameRequirementModal
        {...defaultProps}
        onClose={onClose}
      />,
      { initialPath: "/chat" },
    );

    await user.click(screen.getByRole("button", { name: /leave chat/i }));

    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("calls authClient.updateUser and triggers onSuccess on successful username update", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockUpdateUser.mockResolvedValue({ error: null });

    renderWithProviders(
      <UsernameRequirementModal
        {...defaultProps}
        onSuccess={onSuccess}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /choose a username/i }),
      "cooluser42",
    );
    await user.click(
      screen.getByRole("button", { name: /set username & join chat/i }),
    );

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ username: "cooluser42" });
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Username set successfully!",
        { id: "toast-id" },
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it("shows an error toast and does not call onSuccess when the update fails", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockUpdateUser.mockResolvedValue({
      error: { message: "Username already taken" },
    });

    renderWithProviders(
      <UsernameRequirementModal
        {...defaultProps}
        onSuccess={onSuccess}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /choose a username/i }),
      "takenuser",
    );
    await user.click(
      screen.getByRole("button", { name: /set username & join chat/i }),
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Username already taken", {
        id: "toast-id",
      });
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
