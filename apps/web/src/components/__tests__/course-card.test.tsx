import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseCard, formatDuration } from "~/components/course-card";
import { renderWithProviders } from "~/test-utils";

describe("formatDuration", () => {
  it("returns minutes only when under an hour", () => {
    expect(formatDuration(300)).toBe("5m");
  });

  it("returns hours and minutes when over an hour", () => {
    expect(formatDuration(3660)).toBe("1h 1m");
  });

  it("returns 0m for 0 seconds", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("returns exact hours with 0 minutes", () => {
    expect(formatDuration(7200)).toBe("2h 0m");
  });

  it("handles large durations", () => {
    expect(formatDuration(36000)).toBe("10h 0m");
  });
});

describe("CourseCard", () => {
  const defaultProps = {
    id: "course-1",
    name: "Learn TypeScript",
    description: "A comprehensive TypeScript course",
    thumbnailUrl: null,
    totalModules: 5,
    totalLessons: 30,
    totalDuration: 7200,
    totalEnrollments: 100,
  };

  it("renders the course name", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Learn TypeScript" }),
    ).toBeInTheDocument();
  });

  it("renders the description", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(
      screen.getByText("A comprehensive TypeScript course"),
    ).toBeInTheDocument();
  });

  it("does not render description when null", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        description={null}
      />,
    );
    expect(
      screen.queryByText("A comprehensive TypeScript course"),
    ).not.toBeInTheDocument();
  });

  it("renders module count with correct pluralization", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.getByText("5 modules")).toBeInTheDocument();
  });

  it("renders singular module when count is 1", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        totalModules={1}
      />,
    );
    expect(screen.getByText("1 module")).toBeInTheDocument();
  });

  it("renders lesson count with correct pluralization", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.getByText("30 lessons")).toBeInTheDocument();
  });

  it("renders singular lesson when count is 1", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        totalLessons={1}
      />,
    );
    expect(screen.getByText("1 lesson")).toBeInTheDocument();
  });

  it("renders enrollment count with correct pluralization", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.getByText("100 students")).toBeInTheDocument();
  });

  it("renders singular student when count is 1", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        totalEnrollments={1}
      />,
    );
    expect(screen.getByText("1 student")).toBeInTheDocument();
  });

  it("renders formatted duration", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.getByText("2h 0m")).toBeInTheDocument();
  });

  it("renders thumbnail image when URL is provided", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        thumbnailUrl="https://example.com/thumb.jpg"
      />,
    );
    const img = screen.getByRole("img", { name: "Learn TypeScript" });
    expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("renders placeholder icon when no thumbnail", async () => {
    const { container } = await renderWithProviders(
      <CourseCard {...defaultProps} />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("does not render support ticket count when not provided", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.queryByText(/ticket/)).not.toBeInTheDocument();
  });

  it("renders support ticket count when provided", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        supportTicketCount={3}
      />,
    );
    expect(screen.getByText("3 tickets")).toBeInTheDocument();
  });

  it("renders singular ticket when count is 1", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        supportTicketCount={1}
      />,
    );
    expect(screen.getByText("1 ticket")).toBeInTheDocument();
  });

  it("does not render progress bar when progress is 0", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    expect(screen.queryByText(/complete/)).not.toBeInTheDocument();
  });

  it("renders progress bar when progress > 0", async () => {
    await renderWithProviders(
      <CourseCard
        {...defaultProps}
        progress={75}
      />,
    );
    expect(screen.getByText("75% complete")).toBeInTheDocument();
  });

  it("links to the course page", async () => {
    await renderWithProviders(<CourseCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/course-1");
  });
});
