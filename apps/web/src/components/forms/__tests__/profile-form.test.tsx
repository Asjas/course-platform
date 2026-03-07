import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "~/components/forms/profile-form";

const { mockUseAuth, mockUpdateUser, mockMutateAsync } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockMutateAsync: vi.fn(),
}));

vi.mock("~/components/blocker", () => ({
  default: () => null,
}));

vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: {
    updateUser: mockUpdateUser,
  },
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    images: {
      getPresignedUrl: {
        mutationOptions: vi.fn(() => ({})),
      },
    },
  },
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<object>("@tanstack/react-query");
  return {
    ...actual,
    useMutation: () => ({ mutateAsync: mockMutateAsync }),
  };
});

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-1"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      session: {
        user: {
          id: "user-1",
          name: "Jane Doe",
          username: "janedoe",
          image: null,
          color: "808080",
        },
      },
    });

    mockUpdateUser.mockResolvedValue({ error: null });
    mockMutateAsync.mockResolvedValue({ presignedUrl: "", publicUrl: "" });
  });

  it("renders profile fields and disables save while pristine", () => {
    render(<ProfileForm />);

    expect(screen.getByLabelText("Name (Required)")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Profile Color")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submits updated profile and shows success toast", async () => {
    const { toast } = await import("sonner");

    render(<ProfileForm />);

    fireEvent.change(screen.getByLabelText("Name (Required)"), {
      target: { value: "Jane Updated" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Updated",
          username: "janedoe",
          color: "808080",
        }),
      );
    });

    expect(toast.loading).toHaveBeenCalledWith("Updating profile...");
    expect(toast.success).toHaveBeenCalledWith(
      "Profile updated successfully!",
      {
        id: "toast-1",
      },
    );
  });

  it("shows error toast when update fails", async () => {
    const { toast } = await import("sonner");
    mockUpdateUser.mockResolvedValue({ error: { message: "Update failed" } });

    render(<ProfileForm />);

    fireEvent.change(screen.getByLabelText("Name (Required)"), {
      target: { value: "Jane Updated" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed", {
        id: "toast-1",
      });
    });
  });
});
