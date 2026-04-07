import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoPlayer, type VideoPlayerHandle } from "~/components/video-player";

// ---------------------------------------------------------------------------
// react-youtube mock — captures onReady / onEnd so imperative-handle and
// interval-lifecycle tests can simulate player events.
// ---------------------------------------------------------------------------

/** Captured callback references from the most-recent <YouTube /> render. */
const { capturedCallbacks } = vi.hoisted(() => ({
  capturedCallbacks: {
    onReady: undefined as ((event: { target: unknown }) => void) | undefined,
    onEnd: undefined as (() => void) | undefined,
  },
}));

/** Fake YouTube player with a spy for `seekTo`. */
const fakePlayer = vi.hoisted(() => ({
  seekTo: vi.fn(),
  getCurrentTime: vi.fn(() => 10),
  getDuration: vi.fn(() => 60),
}));

vi.mock("react-youtube", () => ({
  default: ({
    videoId,
    className,
    onReady,
    onEnd,
  }: {
    videoId: string;
    className?: string;
    onReady?: (event: { target: unknown }) => void;
    onEnd?: () => void;
  }) => {
    capturedCallbacks.onReady = onReady;
    capturedCallbacks.onEnd = onEnd;
    return (
      <iframe
        className={className}
        title="YouTube video player"
        src={`https://www.youtube.com/embed/${videoId}`}
        allowFullScreen
      />
    );
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fakePlayer.seekTo.mockClear();
    fakePlayer.getCurrentTime.mockReturnValue(10);
    fakePlayer.getDuration.mockReturnValue(60);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Rendering / URL extraction -------------------------------------------

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
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(vi.fn());
    try {
      render(<VideoPlayer url="not-a-valid-url" />);
      expect(screen.getByText("Invalid video URL")).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("shows invalid video message for empty string", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(vi.fn());
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

  // ---- Imperative handle (seekTo via ref) -----------------------------------

  it("exposes seekTo on the imperative handle that delegates to the player", () => {
    const ref = createRef<VideoPlayerHandle>();
    render(
      <VideoPlayer
        ref={ref}
        url="dQw4w9WgXcQ"
      />,
    );

    // Simulate the player becoming ready
    capturedCallbacks.onReady?.({ target: fakePlayer });

    expect(ref.current).not.toBeNull();
    ref.current?.seekTo(42);
    expect(fakePlayer.seekTo).toHaveBeenCalledWith(42, true);
  });

  it("seekTo is a no-op before the player is ready (no throw)", () => {
    const ref = createRef<VideoPlayerHandle>();
    render(
      <VideoPlayer
        ref={ref}
        url="dQw4w9WgXcQ"
      />,
    );

    // Do NOT fire onReady — seekTo should gracefully no-op
    expect(ref.current).not.toBeNull();
    expect(() => ref.current?.seekTo(10)).not.toThrow();
    expect(fakePlayer.seekTo).not.toHaveBeenCalled();
  });

  // ---- Progress interval lifecycle ------------------------------------------

  it("starts a progress polling interval on ready and invokes onProgress", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        url="dQw4w9WgXcQ"
        onProgress={onProgress}
      />,
    );

    capturedCallbacks.onReady?.({ target: fakePlayer });

    // Advance by one tick
    vi.advanceTimersByTime(1000);
    expect(onProgress).toHaveBeenCalledWith({
      played: 10 / 60,
      playedSeconds: 10,
    });
  });

  it("clears the progress interval on unmount", () => {
    const onProgress = vi.fn();
    const { unmount } = render(
      <VideoPlayer
        url="dQw4w9WgXcQ"
        onProgress={onProgress}
      />,
    );

    capturedCallbacks.onReady?.({ target: fakePlayer });

    // One tick should fire
    vi.advanceTimersByTime(1000);
    expect(onProgress).toHaveBeenCalledTimes(1);

    unmount();

    // Further ticks should NOT fire
    vi.advanceTimersByTime(3000);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });

  it("clears the progress interval when the video ends", () => {
    const onProgress = vi.fn();
    const onEnded = vi.fn();
    render(
      <VideoPlayer
        url="dQw4w9WgXcQ"
        onProgress={onProgress}
        onEnded={onEnded}
      />,
    );

    capturedCallbacks.onReady?.({ target: fakePlayer });
    vi.advanceTimersByTime(1000);
    expect(onProgress).toHaveBeenCalledTimes(1);

    // End playback
    capturedCallbacks.onEnd?.();
    expect(onEnded).toHaveBeenCalledTimes(1);

    // Further ticks should NOT fire
    vi.advanceTimersByTime(3000);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });

  it("clears a prior interval before starting a new one on re-init", () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer
        url="dQw4w9WgXcQ"
        onProgress={onProgress}
      />,
    );

    // First init
    capturedCallbacks.onReady?.({ target: fakePlayer });
    vi.advanceTimersByTime(1000);
    expect(onProgress).toHaveBeenCalledTimes(1);

    // Simulate re-init (player re-ready)
    capturedCallbacks.onReady?.({ target: fakePlayer });
    vi.advanceTimersByTime(1000);

    // Should still only have 1 extra call (not 2 — old interval was cleared)
    expect(onProgress).toHaveBeenCalledTimes(2);
  });

  it("does not start an interval when onProgress is not provided", () => {
    render(<VideoPlayer url="dQw4w9WgXcQ" />);

    capturedCallbacks.onReady?.({ target: fakePlayer });
    vi.advanceTimersByTime(5000);

    // No error and no interval running — test passes if it reaches here
  });
});
