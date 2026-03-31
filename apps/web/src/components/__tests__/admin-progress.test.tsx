import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminProgressPage } from "~/routes/_authenticated/admin/progress";
import { renderWithProviders } from "~/test-utils";

const { mockUseCourseProgressAdmin, mockCourseProgressAdminCollection } =
  vi.hoisted(() => ({
    mockUseCourseProgressAdmin: vi.fn(),
    mockCourseProgressAdminCollection: {
      preload: vi.fn().mockResolvedValue(undefined),
    },
  }));

vi.mock("~/collections/course-progress", () => ({
  CourseProgressAdminCollection: mockCourseProgressAdminCollection,
}));
vi.mock("~/hooks/use-course-progress", () => ({
  useCourseProgressAdmin: mockUseCourseProgressAdmin,
}));

function makeProgressItem(
  overrides: Partial<{
    id: string;
    progress: number | null;
    completedAt: Date | null;
    startedAt: Date | null;
    lastAccessedAt: Date | null;
    user: { id: string; name: string; email: string } | null;
    course: { id: string; name: string; slug: string } | null;
  }> = {},
) {
  return {
    id: "progress:1",
    progress: 65,
    completedAt: null,
    startedAt: new Date("2024-01-10"),
    lastAccessedAt: new Date("2024-03-01"),
    user: { id: "user:1", name: "Alice Johnson", email: "alice@example.com" },
    course: { id: "course:1", name: "Learn TypeScript", slug: "typescript" },
    ...overrides,
  };
}

describe("AdminProgressPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCourseProgressAdmin.mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the page heading", async () => {
    await renderWithProviders(<AdminProgressPage />);
    expect(
      screen.getByRole("heading", { name: "Course Progress" }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no progress data exists", async () => {
    await renderWithProviders(<AdminProgressPage />);
    expect(screen.getByText("No progress data")).toBeInTheDocument();
    expect(
      screen.getByText("There is no course progress data to display yet."),
    ).toBeInTheDocument();
  });

  it("renders progress rows in the table", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem()],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Learn TypeScript")).toBeInTheDocument();
  });

  it("renders a progress bar with correct aria attributes", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ progress: 75 })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    const progressBar = screen.getByRole("progressbar", {
      name: /75% complete/i,
    });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("shows percentage text", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ progress: 50 })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows Yes completion status when completedAt is set", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [
        makeProgressItem({
          completedAt: new Date("2024-03-15"),
          progress: 100,
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("shows No completion status when completedAt is null", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ completedAt: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders Unknown User when user is null", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ user: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);
    expect(screen.getByText("Unknown User")).toBeInTheDocument();
  });

  it("renders Unknown Course when course is null", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ course: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);
    expect(screen.getByText("Unknown Course")).toBeInTheDocument();
  });

  it("renders multiple progress items", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [
        makeProgressItem({
          id: "p:1",
          user: { id: "u1", name: "Alice", email: "alice@example.com" },
        }),
        makeProgressItem({
          id: "p:2",
          user: { id: "u2", name: "Bob", email: "bob@example.com" },
        }),
      ],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("handles null progress value by defaulting to 0%", async () => {
    mockUseCourseProgressAdmin.mockReturnValue({
      data: [makeProgressItem({ progress: null })],
      isLoading: false,
    });

    await renderWithProviders(<AdminProgressPage />);

    const progressBar = screen.getByRole("progressbar", {
      name: /0% complete/i,
    });
    expect(progressBar).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
