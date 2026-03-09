import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatDateDivider } from "~/components/chat-date-divider";

vi.mock("date-fns", () => ({
  format: vi.fn(
    (date: Date) =>
      `${date.toLocaleDateString("en-US", { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`,
  ),
  isToday: vi.fn((date: Date) => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }),
  isYesterday: vi.fn((date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  }),
}));

describe("ChatDateDivider", () => {
  it("renders with separator role", () => {
    render(<ChatDateDivider date={new Date()} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("shows 'Today' for today's date", () => {
    render(<ChatDateDivider date={new Date()} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows 'Yesterday' for yesterday's date", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    render(<ChatDateDivider date={yesterday} />);
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("shows formatted date for older dates", () => {
    const oldDate = new Date(2024, 0, 15); // Jan 15, 2024
    render(<ChatDateDivider date={oldDate} />);
    // Should not show Today or Yesterday
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    expect(screen.queryByText("Yesterday")).not.toBeInTheDocument();
  });

  it("has accessible aria-label on separator", () => {
    render(<ChatDateDivider date={new Date()} />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-label",
      "Today",
    );
  });

  it("renders the chevron icon as decorative", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders horizontal divider lines", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const dividers = container.querySelectorAll(".border-t");
    expect(dividers).toHaveLength(2);
  });

  it("renders date pill with proper styling", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const pill = container.querySelector(".rounded-full");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass("border");
  });

  it("centers the date between divider lines", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const wrapper = container.querySelector(".relative");
    expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
  });

  it("uses correct text styling for date label", () => {
    render(<ChatDateDivider date={new Date()} />);
    const dateLabel = screen.getByText("Today").parentElement;
    expect(dateLabel).toHaveClass("text-xs", "font-semibold");
  });

  it("has correct vertical spacing", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const wrapper = container.querySelector(".relative");
    expect(wrapper).toHaveClass("my-4");
  });

  it("formats date with correct month and year", () => {
    const testDate = new Date(2025, 5, 15); // June 15, 2025
    render(<ChatDateDivider date={testDate} />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-label", "June 15, 2025");
  });

  it("handles dates at year boundaries correctly", () => {
    const newYear = new Date(2026, 0, 1); // Jan 1, 2026
    render(<ChatDateDivider date={newYear} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders with shadow on date pill", () => {
    const { container } = render(<ChatDateDivider date={new Date()} />);
    const pill = container.querySelector(".rounded-full");
    expect(pill).toHaveClass("shadow-sm");
  });

  it("uses semantic separator role for accessibility", () => {
    render(<ChatDateDivider date={new Date()} />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("DIV");
  });
});
