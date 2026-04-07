/**
 * Tests for CoursePublishSection (Phase 4 publish gating).
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoursePublishSection } from "~/components/course-publish-section";
import { renderWithProviders, renderWithQueryClient } from "~/test-utils";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockUpdateCourseMutationFn, mockCheckReadinessQuery, mockToast } =
  vi.hoisted(() => ({
    mockUpdateCourseMutationFn: vi.fn(),
    mockCheckReadinessQuery: vi.fn(),
    mockToast: {
      loading: vi.fn(() => "toast-id"),
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    courses: {
      updateCourse: {
        mutationOptions: vi.fn(() => ({
          mutationFn: mockUpdateCourseMutationFn,
        })),
      },
    },
  },
  trpcClient: {
    courses: {
      checkPublishReadiness: {
        query: mockCheckReadinessQuery,
      },
    },
  },
}));

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("~/lib/query.client", () => ({
  queryClient: {
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const defaultProps = {
  courseId: "course-1",
  courseName: "Intro to Fastify",
  isPublished: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CoursePublishSection — initial state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Draft' status and a 'Publish Course' button when not published", () => {
    renderWithQueryClient(<CoursePublishSection {...defaultProps} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish Course" }),
    ).toBeInTheDocument();
  });

  it("shows 'Published' status and an 'Unpublish' button when already published", () => {
    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unpublish" }),
    ).toBeInTheDocument();
  });

  it("does not show the 'Publish Course' button when already published", () => {
    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Publish Course" }),
    ).not.toBeInTheDocument();
  });
});

describe("CoursePublishSection — publish flow", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls checkPublishReadiness when the Publish Course button is clicked", async () => {
    mockCheckReadinessQuery.mockResolvedValue({ ready: true, issues: [] });
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    expect(mockCheckReadinessQuery).toHaveBeenCalledWith({
      courseId: "course-1",
    });
  });

  it("calls updateCourse mutation when all lessons are ready", async () => {
    mockCheckReadinessQuery.mockResolvedValue({ ready: true, issues: [] });
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await waitFor(() => {
      expect(mockUpdateCourseMutationFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: "course-1", published: true }),
        expect.anything(),
      );
    });
  });

  it("shows success toast after publishing", async () => {
    mockCheckReadinessQuery.mockResolvedValue({ ready: true, issues: [] });
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining("published"),
        expect.any(Object),
      );
    });
  });

  it("shows error toast when readiness check throws", async () => {
    mockCheckReadinessQuery.mockRejectedValue(new Error("Network error"));

    renderWithQueryClient(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to check"),
      );
    });
    expect(mockUpdateCourseMutationFn).not.toHaveBeenCalled();
  });
});

describe("CoursePublishSection — transcript issues", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows blocking lessons list when there are issues", async () => {
    mockCheckReadinessQuery.mockResolvedValue({
      ready: false,
      issues: [
        { lessonId: "l1", lessonTitle: "Intro to Fastify", reason: "missing" },
        {
          lessonId: "l2",
          lessonTitle: "Advanced Routes",
          reason: "no_cues",
        },
      ],
    });

    await renderWithProviders(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await screen.findByText(/Cannot publish/i);
    expect(screen.getByText("Intro to Fastify")).toBeInTheDocument();
    expect(screen.getByText("Advanced Routes")).toBeInTheDocument();
    expect(mockUpdateCourseMutationFn).not.toHaveBeenCalled();
  });

  it("shows 'No transcript uploaded' label for missing reason", async () => {
    mockCheckReadinessQuery.mockResolvedValue({
      ready: false,
      issues: [{ lessonId: "l1", lessonTitle: "Lesson 1", reason: "missing" }],
    });

    await renderWithProviders(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await screen.findByText(/Cannot publish/i);
    expect(screen.getByText(/No transcript uploaded/i)).toBeInTheDocument();
  });

  it("shows 'Transcript has no caption cues' label for no_cues reason", async () => {
    mockCheckReadinessQuery.mockResolvedValue({
      ready: false,
      issues: [{ lessonId: "l1", lessonTitle: "Lesson 1", reason: "no_cues" }],
    });

    await renderWithProviders(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await screen.findByText(/Cannot publish/i);
    expect(
      screen.getByText(/Transcript has no caption cues/i),
    ).toBeInTheDocument();
  });

  it("shows 'Transcript data is malformed' label for invalid_schema reason", async () => {
    mockCheckReadinessQuery.mockResolvedValue({
      ready: false,
      issues: [
        { lessonId: "l1", lessonTitle: "Lesson 1", reason: "invalid_schema" },
      ],
    });

    await renderWithProviders(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await screen.findByText(/Cannot publish/i);
    expect(
      screen.getByText(/Transcript data is malformed/i),
    ).toBeInTheDocument();
  });

  it("does not call updateCourse when there are blocking issues", async () => {
    mockCheckReadinessQuery.mockResolvedValue({
      ready: false,
      issues: [{ lessonId: "l1", lessonTitle: "Intro", reason: "missing" }],
    });

    await renderWithProviders(<CoursePublishSection {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Publish Course" }));

    await screen.findByText(/Cannot publish/i);
    expect(mockUpdateCourseMutationFn).not.toHaveBeenCalled();
  });
});

describe("CoursePublishSection — unpublish flow", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateCourse with published:false when Unpublish is clicked", async () => {
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => {
      expect(mockUpdateCourseMutationFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: "course-1", published: false }),
        expect.anything(),
      );
    });
  });

  it("does not call checkPublishReadiness when unpublishing", async () => {
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => {
      expect(mockUpdateCourseMutationFn).toHaveBeenCalled();
    });
    expect(mockCheckReadinessQuery).not.toHaveBeenCalled();
  });

  it("shows success toast after unpublishing", async () => {
    mockUpdateCourseMutationFn.mockResolvedValue({ id: "course-1" });

    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining("draft"),
        expect.any(Object),
      );
    });
  });

  it("shows error toast when unpublish fails", async () => {
    mockUpdateCourseMutationFn.mockRejectedValue(new Error("Server error"));

    renderWithQueryClient(
      <CoursePublishSection
        {...defaultProps}
        isPublished={true}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to unpublish"),
        expect.any(Object),
      );
    });
  });
});
