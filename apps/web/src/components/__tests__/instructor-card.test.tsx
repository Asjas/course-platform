import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InstructorCard from "~/components/instructor-card";

describe("InstructorCard", () => {
  it("renders the instructor name", () => {
    render(<InstructorCard />);
    expect(screen.getByText("Codewizard (A-J Roos)")).toBeInTheDocument();
  });

  it("renders the instructor title", () => {
    render(<InstructorCard />);
    expect(
      screen.getByText("Full-Stack Web Developer & Educator"),
    ).toBeInTheDocument();
  });

  it("renders the heading by default", () => {
    render(<InstructorCard />);
    const heading = screen.getByText("Your Instructor");
    expect(heading).toBeInTheDocument();
    expect(heading).not.toHaveClass("hidden");
  });

  it("hides the heading when hideHeading is true", () => {
    render(<InstructorCard hideHeading />);
    const heading = screen.getByText("Your Instructor");
    expect(heading).toHaveClass("hidden");
  });

  it("renders the instructor avatar", () => {
    render(<InstructorCard />);
    const img = screen.getByAltText("Codewizard");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/codewizard.jpg");
  });

  it("renders the description text", () => {
    render(<InstructorCard />);
    expect(
      screen.getByText(/full-stack web developer with years of experience/i),
    ).toBeInTheDocument();
  });
});
