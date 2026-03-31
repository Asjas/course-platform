import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "~/components/video-player";

// react-youtube requires the YouTube IFrame API which is browser-only and
// cannot run in JSDOM. We mock it with a realistic iframe substitute so
// tests can still verify video ID extraction and component behaviour.
vi.mock("react-youtube", () => ({
  default: ({
    videoId,
    className,
  }: {
    videoId: string;
    className?: string;
  }) => (
    <iframe
      className={className}
      title="YouTube video player"
      src={`https://www.youtube.com/embed/${videoId}`}
      allowFullScreen
    />
  ),
}));

describe("VideoPlayer", () => {
  it("renders a YouTube player with a valid video ID", () => {
    render(<VideoPlayer url="dQw4w9WgXcQ" />);
    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("renders a YouTube player from a youtube.com URL", () => {
    render(<VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);
    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe.getAttribute("src")).toContain("dQw4w9WgXcQ");
  });

  it("renders a YouTube player from a youtu.be URL", () => {
    render(<VideoPlayer url="https://youtu.be/dQw4w9WgXcQ" />);
    const iframe = screen.getByTitle("YouTube video player");
    expect(iframe.getAttribute("src")).toContain("dQw4w9WgXcQ");
  });

  it("shows invalid video message for bad URL", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    try {
      render(<VideoPlayer url="not-a-valid-url" />);
      expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("shows invalid video message for empty string", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    try {
      render(<VideoPlayer url="" />);
      expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("applies custom className to the wrapper", () => {
    const { container } = render(
      <VideoPlayer
        className="custom-class"
        url="dQw4w9WgXcQ"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
