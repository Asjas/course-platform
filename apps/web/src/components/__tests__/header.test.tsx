import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "~/components/header";
import { renderWithProviders } from "~/test-utils";

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...(actual as object),
    useQuery: mockUseQuery,
    useMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  };
});

vi.mock("~/components/notifications-bell", () => ({
  NotificationsBell: ({ userId }: { userId: string }) => (
    <div>Notifications for {userId}</div>
  ),
}));

vi.mock("~/components/theme-toggle", () => ({
  ThemeToggle: () => <div>Theme toggle</div>,
}));

vi.mock("~/components/ui/menu", () => ({
  Menu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  MenuPopover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    supportStatus: {
      getMyStatus: {
        queryOptions: vi.fn(() => ({
          queryKey: ["support-status"],
          queryFn: vi.fn().mockResolvedValue({ status: "online" }),
        })),
        queryKey: vi.fn(() => ["support-status"]),
      },
      getSupportTeam: {
        queryKey: vi.fn(() => ["support-team"]),
      },
      setStatus: {
        mutate: vi.fn(),
      },
    },
    syncStatus: {
      getAll: {
        queryOptions: vi.fn(() => ({
          queryKey: ["sync-status"],
          queryFn: vi.fn().mockResolvedValue([]),
        })),
      },
    },
  },
  trpcClient: {
    supportStatus: {
      setStatus: { mutate: vi.fn() },
    },
  },
}));

vi.mock("~/lib/auth.client", () => ({
  authClient: {
    signOut: vi.fn(),
    admin: {
      stopImpersonating: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Header", () => {
  it("shows public nav actions for unauthenticated users", async () => {
    mockUseQuery.mockImplementation(({ enabled }: { enabled?: boolean }) => ({
      data: enabled ? [] : undefined,
    }));

    await renderWithProviders(
      <Header
        auth={{
          isAuthenticated: false,
          session: null,
          hasRole: () => false,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
  });

  it("shows authenticated nav and admin link for admin users", async () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === "support-status") {
        return { data: { status: "online" } };
      }
      return { data: [] };
    });

    await renderWithProviders(
      <Header
        auth={{
          isAuthenticated: true,
          session: {
            session: {
              id: "session-1",
              userId: "user-1",
              expiresAt: new Date(),
              token: "token",
              createdAt: new Date(),
              updatedAt: new Date(),
              ipAddress: null,
              userAgent: null,
              impersonatedBy: null,
            },
            user: {
              id: "user-1",
              email: "admin@example.com",
              emailVerified: true,
              name: "Admin",
              username: "admin",
              displayUsername: "admin",
              role: "admin",
              createdAt: new Date(),
              updatedAt: new Date(),
              image: null,
              banned: false,
              banReason: null,
              banExpires: null,
            },
          },
          hasRole: (role) => role === "admin",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByText("Theme toggle")).toBeInTheDocument();
    expect(screen.getByText("Notifications for user-1")).toBeInTheDocument();
  });

  it("shows syncing status affordance when active sync is in progress", async () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === "sync-status") {
        return {
          data: [
            {
              syncState: "syncing",
              isOnline: true,
              pendingUpdates: 0,
            },
          ],
        };
      }
      return { data: undefined };
    });

    await renderWithProviders(
      <Header
        auth={{
          isAuthenticated: true,
          session: {
            session: {
              id: "session-1",
              userId: "user-1",
              expiresAt: new Date(),
              token: "token",
              createdAt: new Date(),
              updatedAt: new Date(),
              ipAddress: null,
              userAgent: null,
              impersonatedBy: null,
            },
            user: {
              id: "user-1",
              email: "user@example.com",
              emailVerified: true,
              name: "User",
              username: "user",
              displayUsername: "user",
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date(),
              image: null,
              banned: false,
              banReason: null,
              banExpires: null,
            },
          },
          hasRole: () => false,
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Syncing data..." }),
    ).toBeInTheDocument();
  });
});
