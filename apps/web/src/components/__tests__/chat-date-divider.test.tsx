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
});
