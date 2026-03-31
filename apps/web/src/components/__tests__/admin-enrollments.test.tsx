import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminEnrollmentsPage } from "~/routes/_authenticated/admin/enrollments";
import { renderWithProviders } from "~/test-utils";

const { mockUseEnrollmentsAdmin, mockEnrollmentsAdminCollection } = vi.hoisted(
  () => ({
    mockUseEnrollmentsAdmin: vi.fn(),
    mockEnrollmentsAdminCollection: {
      preload: vi.fn().mockResolvedValue(undefined),
    },
  }),
);

vi.mock("~/collections/enrollments", () => ({
  EnrollmentsAdminCollection: mockEnrollmentsAdminCollection,
}));
vi.mock("~/hooks/use-enrollments", () => ({
  useEnrollmentsAdmin: mockUseEnrollmentsAdmin,
}));

function makeEnrollment(
  overrides: Partial<{
    id: string;
    enrollmentType: string;
    enrollmentSource: string;
    status: string;
    enrolledAt: Date;
    user: { id: string; name: string; email: string } | null;
    course: { id: string; name: string; slug: string } | null;
  }> = {},
) {
  return {
    id: "enroll:1",
    enrollmentType: "individual",
    enrollmentSource: "direct",
    status: "active",
    enrolledAt: new Date("2024-02-01"),
    user: { id: "user:1", name: "Alice Johnson", email: "alice@example.com" },
    course: { id: "course:1", name: "Learn TypeScript", slug: "typescript" },
    ...overrides,
  };
}

describe("AdminEnrollmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEnrollmentsAdmin.mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the page heading", async () => {
    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(
      screen.getByRole("heading", { name: "Enrollments" }),
    ).toBeInTheDocument();
  });

  it("renders a search input", async () => {
    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(
      screen.getByRole("searchbox", { name: /search enrollments/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no enrollments exist", async () => {
    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("No enrollments found")).toBeInTheDocument();
    expect(
      screen.getByText("There are no enrollments yet."),
    ).toBeInTheDocument();
  });

  it("renders enrollment rows in the table", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment()],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Learn TypeScript")).toBeInTheDocument();
  });

  it("renders color-coded Active status badge", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ status: "active" })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders color-coded Cancelled status badge", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ status: "cancelled" })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders color-coded Completed status badge", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ status: "completed" })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders color-coded Refunded status badge", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ status: "refunded" })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Refunded")).toBeInTheDocument();
  });

  it("filters enrollments by user name via search", async () => {
    const user = userEvent.setup();
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [
        makeEnrollment({
          id: "enroll:1",
          user: { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
        }),
        makeEnrollment({
          id: "enroll:2",
          user: { id: "u2", name: "Bob Smith", email: "bob@example.com" },
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search enrollments/i,
    });
    await user.type(searchInput, "alice");

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });

  it("filters enrollments by course name via search", async () => {
    const user = userEvent.setup();
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [
        makeEnrollment({
          id: "enroll:1",
          course: { id: "c1", name: "Learn TypeScript", slug: "ts" },
        }),
        makeEnrollment({
          id: "enroll:2",
          course: { id: "c2", name: "Fastify Fundamentals", slug: "fastify" },
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search enrollments/i,
    });
    await user.type(searchInput, "fastify");

    expect(screen.getByText("Fastify Fundamentals")).toBeInTheDocument();
    expect(screen.queryByText("Learn TypeScript")).not.toBeInTheDocument();
  });

  it("shows empty state search message when no results match filter", async () => {
    const user = userEvent.setup();
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment()],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search enrollments/i,
    });
    await user.type(searchInput, "zzznotfound");

    expect(screen.getByText("No enrollments found")).toBeInTheDocument();
    expect(
      screen.getByText("No enrollments match your search."),
    ).toBeInTheDocument();
  });

  it("renders Unknown User when user is null", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ user: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Unknown User")).toBeInTheDocument();
  });

  it("renders Unknown Course when course is null", async () => {
    mockUseEnrollmentsAdmin.mockReturnValue({
      data: [makeEnrollment({ course: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminEnrollmentsPage />);
    expect(screen.getByText("Unknown Course")).toBeInTheDocument();
  });
});
