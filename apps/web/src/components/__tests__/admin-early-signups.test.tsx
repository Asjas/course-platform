import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminEarlySignupsPage } from "~/routes/_authenticated/admin/early-signups";
import { renderWithProviders } from "~/test-utils";

const { mockUseEarlySignups, mockEarlySignupsCollection, mockToast } =
  vi.hoisted(() => ({
    mockUseEarlySignups: vi.fn(),
    mockEarlySignupsCollection: {
      update: vi.fn(),
      preload: vi.fn().mockResolvedValue(undefined),
    },
    mockToast: {
      loading: vi.fn().mockReturnValue("toast-id"),
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

vi.mock("~/collections/early-signups", () => ({
  EarlySignupsCollection: mockEarlySignupsCollection,
}));
vi.mock("~/hooks/use-early-signups", () => ({
  useEarlySignups: mockUseEarlySignups,
}));

vi.mock("sonner", () => ({ toast: mockToast }));

function makeSignup(
  overrides: Partial<{
    id: string;
    email: string;
    name: string | null;
    source: string;
    referrer: string | null;
    confirmedAt: Date | null;
    unsubscribedAt: Date | null;
    sourceTable: "early_signup" | "course_wishlist";
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: "signup:1",
    email: "alice@example.com",
    name: "Alice",
    source: "learnfastify",
    referrer: null,
    confirmedAt: null,
    unsubscribedAt: null,
    sourceTable: "course_wishlist",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    ...overrides,
  };
}

describe("AdminEarlySignupsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEarlySignups.mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the page heading", async () => {
    await renderWithProviders(<AdminEarlySignupsPage />);
    expect(
      screen.getByRole("heading", { name: "Early Signups" }),
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no signups", async () => {
    await renderWithProviders(<AdminEarlySignupsPage />);
    expect(screen.getByText("No early signups")).toBeInTheDocument();
    expect(
      screen.getByText("There are no early access signups yet."),
    ).toBeInTheDocument();
  });

  it("renders signups in the table", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [
        makeSignup({ email: "alice@example.com", source: "learnfastify" }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("learnfastify")).toBeInTheDocument();
  });

  it("renders status filter controls", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [makeSignup({ id: "signup:1" })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invited" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Canceled" }),
    ).toBeInTheDocument();
  });

  it("filters rows by selected status", async () => {
    const user = userEvent.setup();
    mockUseEarlySignups.mockReturnValue({
      data: [
        makeSignup({
          id: "signup:pending",
          email: "pending@example.com",
          confirmedAt: null,
          unsubscribedAt: null,
        }),
        makeSignup({
          id: "signup:invited",
          email: "invited@example.com",
          confirmedAt: new Date("2024-01-20"),
          unsubscribedAt: null,
        }),
        makeSignup({
          id: "signup:canceled",
          email: "canceled@example.com",
          unsubscribedAt: new Date("2024-01-21"),
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    await user.click(screen.getByRole("button", { name: "Pending" }));
    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
    expect(screen.queryByText("invited@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("canceled@example.com")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Invited" }));
    expect(screen.getByText("invited@example.com")).toBeInTheDocument();
    expect(screen.queryByText("pending@example.com")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Canceled" }));
    expect(screen.getByText("canceled@example.com")).toBeInTheDocument();
    expect(screen.queryByText("invited@example.com")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
    expect(screen.getByText("invited@example.com")).toBeInTheDocument();
    expect(screen.getByText("canceled@example.com")).toBeInTheDocument();
  });

  it("shows reactivated signup as invited only after unsubscribedAt is cleared", async () => {
    const user = userEvent.setup();

    mockUseEarlySignups.mockReturnValue({
      data: [
        makeSignup({
          id: "signup:still-canceled",
          email: "still-canceled@example.com",
          confirmedAt: new Date("2024-01-20"),
          unsubscribedAt: new Date("2024-01-21"),
        }),
        makeSignup({
          id: "signup:reactivated",
          email: "reactivated@example.com",
          confirmedAt: new Date("2024-01-22"),
          unsubscribedAt: null,
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    await user.click(screen.getByRole("button", { name: "Invited" }));

    expect(screen.getByText("reactivated@example.com")).toBeInTheDocument();
    expect(
      screen.queryByText("still-canceled@example.com"),
    ).not.toBeInTheDocument();
  });

  it("shows Send Invite button for unconfirmed signups", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [makeSignup({ confirmedAt: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(
      screen.getByRole("button", { name: /send invite/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("shows Invited badge for already-confirmed signups", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [makeSignup({ confirmedAt: new Date("2024-01-20") })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(screen.getAllByText("Invited").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByRole("button", { name: /send invite/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("shows Canceled badge when signup is canceled", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [makeSignup({ unsubscribedAt: new Date("2024-01-21") })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(screen.getAllByText("Canceled").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByRole("button", { name: /send invite/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("disables the Send Invite button while sending", async () => {
    const user = userEvent.setup();
    let resolveUpdate!: () => void;
    const pendingUpdate = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const signup = makeSignup({ id: "signup:1", email: "alice@example.com" });
    mockUseEarlySignups.mockReturnValue({ data: [signup], isLoading: false });
    mockEarlySignupsCollection.update.mockReturnValueOnce(pendingUpdate);

    await renderWithProviders(<AdminEarlySignupsPage />);

    await user.click(screen.getByRole("button", { name: /send invite/i }));

    // Button should be disabled while sending
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    // Resolve the promise and wait for the React state update (setSendingIds in
    // the finally block) to settle before the test ends.
    resolveUpdate();
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sending/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("calls EarlySignupsCollection.update when Send Invite is clicked", async () => {
    const user = userEvent.setup();
    const signup = makeSignup({ id: "signup:1", email: "alice@example.com" });
    mockUseEarlySignups.mockReturnValue({
      data: [signup],
      isLoading: false,
    });
    mockEarlySignupsCollection.update.mockResolvedValueOnce(undefined);

    await renderWithProviders(<AdminEarlySignupsPage />);

    await user.click(screen.getByRole("button", { name: /send invite/i }));

    expect(mockEarlySignupsCollection.update).toHaveBeenCalledWith(
      "signup:1",
      expect.any(Function),
    );
    expect(mockToast.loading).toHaveBeenCalled();
  });

  it("shows success toast after sending invite", async () => {
    const user = userEvent.setup();
    const signup = makeSignup({ email: "alice@example.com" });
    mockUseEarlySignups.mockReturnValue({ data: [signup], isLoading: false });
    mockEarlySignupsCollection.update.mockResolvedValueOnce(undefined);

    await renderWithProviders(<AdminEarlySignupsPage />);
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining("alice@example.com"),
      expect.anything(),
    );
  });

  it("shows error toast when sending invite fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(vi.fn());
    try {
      const user = userEvent.setup();
      const signup = makeSignup({ email: "alice@example.com" });
      mockUseEarlySignups.mockReturnValue({
        data: [signup],
        isLoading: false,
      });
      mockEarlySignupsCollection.update.mockRejectedValueOnce(
        new Error("Network error"),
      );

      await renderWithProviders(<AdminEarlySignupsPage />);
      await user.click(screen.getByRole("button", { name: /send invite/i }));

      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to send invite. Please try again.",
        expect.anything(),
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("cancels pending invite", async () => {
    const user = userEvent.setup();
    const signup = makeSignup({ id: "signup:1", email: "alice@example.com" });
    mockUseEarlySignups.mockReturnValue({ data: [signup], isLoading: false });
    mockEarlySignupsCollection.update.mockResolvedValueOnce(undefined);

    await renderWithProviders(<AdminEarlySignupsPage />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockEarlySignupsCollection.update).toHaveBeenCalledWith(
      "signup:1",
      expect.any(Function),
    );
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining("alice@example.com"),
      expect.anything(),
    );
  });

  it("renders dash when name is absent", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [makeSignup({ name: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders both invited and uninvited signups correctly", async () => {
    mockUseEarlySignups.mockReturnValue({
      data: [
        makeSignup({ id: "signup:1", email: "alice@example.com" }),
        makeSignup({
          id: "signup:2",
          email: "bob@example.com",
          confirmedAt: new Date(),
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEarlySignupsPage />);

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send invite/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Invited").length).toBeGreaterThanOrEqual(1);
  });
});
