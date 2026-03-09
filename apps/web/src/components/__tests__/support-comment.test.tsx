import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SupportComment from "~/components/support-comment";
import { renderWithProviders } from "~/test-utils";

const { mockUseAuth, mockRenderMarkdown } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockRenderMarkdown: vi.fn(),
}));

vi.mock("~/lib/auth.context", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("~/lib/markdown", () => ({
  renderMarkdown: mockRenderMarkdown,
}));

describe("SupportComment", () => {
  beforeEach(() => {
    mockRenderMarkdown.mockResolvedValue("<p>Rendered support comment</p>");
    vi.clearAllMocks();
  });

  it("renders author, timestamp, and markdown content", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
      hasRole: () => false,
    });

    await renderWithProviders(
      <SupportComment
        ticket={
          {
            id: "ticket-1",
            user: {
              id: "user-1",
              name: "Taylor",
              image: "https://example.com/taylor.png",
            },
          } as never
        }
        content="**hello**"
        date={new Date("2026-03-09T11:00:00.000Z")}
      />,
    );

    expect(screen.getByAltText("Taylor")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
    expect(screen.getByText(/commented/i)).toBeInTheDocument();
    expect(
      await screen.findByText("Rendered support comment"),
    ).toBeInTheDocument();
  });

  it("shows author badge and actions for the ticket owner", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
      hasRole: () => false,
    });

    await renderWithProviders(
      <SupportComment
        ticket={
          {
            id: "ticket-1",
            user: {
              id: "user-1",
              name: "Owner",
              image: null,
            },
          } as never
        }
        content="Owner comment"
        date={new Date("2026-03-09T11:00:00.000Z")}
      />,
    );

    expect(screen.getByText("Author")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Message actions" }),
    ).toBeInTheDocument();
  });

  it("shows actions for admins even when they are not the owner", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "admin-1" } },
      hasRole: (role: string) => role === "admin",
    });

    await renderWithProviders(
      <SupportComment
        ticket={
          {
            id: "ticket-1",
            user: {
              id: "owner-1",
              name: "Owner",
              image: null,
            },
          } as never
        }
        content="Admin can moderate"
        date={new Date("2026-03-09T11:00:00.000Z")}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Message actions" }),
    ).toBeInTheDocument();
  });

  it("invokes edit and delete placeholders through the action menu", async () => {
    const user = userEvent.setup();
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);

    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
      hasRole: () => false,
    });

    await renderWithProviders(
      <SupportComment
        ticket={
          {
            id: "ticket-1",
            user: {
              id: "user-1",
              name: "Owner",
              image: null,
            },
          } as never
        }
        content="Action menu"
        date={new Date("2026-03-09T11:00:00.000Z")}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Message actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Edit functionality is not implemented yet.",
      );
    });

    await user.click(screen.getByRole("button", { name: "Message actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Delete functionality is not implemented yet.",
      );
    });

    alertSpy.mockRestore();
  });
});
