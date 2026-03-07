import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "~/components/video-player";

vi.mock("react-youtube", () => ({
  default: ({
    videoId,
    className,
  }: {
    videoId: string;
    className?: string;
  }) => (
    <div
      className={className}
      data-testid="youtube-player"
      data-video-id={videoId}
    >
      YouTube Player: {videoId}
    </div>
  ),
}));

describe("VideoPlayer", () => {
  it("renders a YouTube player with a valid video ID", () => {
    render(<VideoPlayer url="dQw4w9WgXcQ" />);
    const player = screen.getByTestId("youtube-player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute("data-video-id", "dQw4w9WgXcQ");
  });

  it("renders a YouTube player from a youtube.com URL", () => {
    render(<VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);
    const player = screen.getByTestId("youtube-player");
    expect(player).toHaveAttribute("data-video-id", "dQw4w9WgXcQ");
  });

  it("renders a YouTube player from a youtu.be URL", () => {
    render(<VideoPlayer url="https://youtu.be/dQw4w9WgXcQ" />);
    const player = screen.getByTestId("youtube-player");
    expect(player).toHaveAttribute("data-video-id", "dQw4w9WgXcQ");
  });

  it("shows invalid video message for bad URL", () => {
    render(<VideoPlayer url="not-a-valid-url" />);
    expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
  });

  it("shows invalid video message for empty string", () => {
    render(<VideoPlayer url="" />);
    expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <VideoPlayer
        className="custom-class"
        url="dQw4w9WgXcQ"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("custom-class");
  });
});
