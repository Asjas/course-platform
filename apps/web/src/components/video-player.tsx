import { type SyntheticEvent, useCallback, useRef } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  className?: string;
  controls?: boolean;
  playing?: boolean;
  muted?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  onReady?: () => void;
  onError?: (error: unknown) => void;
  onEnded?: () => void;
  /** Progress callback with played fraction (0-1) and playedSeconds */
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
}

/**
 * Reusable video player component supporting YouTube, Vimeo, and other sources
 * Uses react-player for universal video support
 *
 * @example
 * // YouTube video
 * <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
 *
 * @example
 * // Vimeo video
 * <VideoPlayer url="https://vimeo.com/123456789" />
 *
 * @example
 * // Direct video file
 * <VideoPlayer url="https://example.com/video.mp4" controls />
 */
export function VideoPlayer({
  url,
  className = "",
  controls = true,
  playing = false,
  muted = false,
  loop = false,
  width = "100%",
  height = "100%",
  onReady,
  onError,
  onEnded,
  onProgress,
}: VideoPlayerProps) {
  const lastProgressRef = useRef<number>(0);

  // Handle timeupdate events and convert to progress format
  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      if (!onProgress) return;

      const video = event.currentTarget;
      const playedSeconds = video.currentTime;
      const duration = video.duration;

      if (duration && Number.isFinite(duration)) {
        const played = playedSeconds / duration;

        // Only call onProgress if there's meaningful change (avoid excessive calls)
        if (Math.abs(played - lastProgressRef.current) >= 0.01) {
          lastProgressRef.current = played;
          onProgress({ played, playedSeconds });
        }
      }
    },
    [onProgress],
  );

  return (
    <div
      className={`aspect-video w-full bg-gray-900 ${className}`}
      style={{ width, height }}
    >
      <ReactPlayer
        src={url}
        controls={controls}
        playing={playing}
        muted={muted}
        loop={loop}
        width="100%"
        height="100%"
        onReady={onReady}
        onError={(error) => {
          console.error("Video player error:", error);
          onError?.(error);
        }}
        onEnded={onEnded}
        onTimeUpdate={onProgress ? handleTimeUpdate : undefined}
      />
    </div>
  );
}
