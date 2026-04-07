import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import YouTube, { type YouTubeEvent, type YouTubeProps } from "react-youtube";

/** Imperative handle exposed via `ref` on `VideoPlayer`. */
export interface VideoPlayerHandle {
  /** Seek the video to `seconds`. */
  seekTo: (seconds: number) => void;
}

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
 * Extract YouTube video ID from URL or return as-is if already an ID
 */
function extractYouTubeId(urlOrId: string): string | null {
  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  try {
    const url = new URL(urlOrId);
    // youtube.com/watch?v=VIDEO_ID
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
    // youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1);
    }
  } catch {
    // Invalid URL, return null
  }
  return null;
}

/**
 * Lightweight YouTube video player component
 * Uses react-youtube for efficient YouTube embeds
 *
 * @example
 * // YouTube video URL
 * <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
 *
 * @example
 * // YouTube video ID
 * <VideoPlayer url="dQw4w9WgXcQ" />
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      url,
      className = "",
      controls = true,
      playing = false,
      muted = false,
      loop = false,
      onReady,
      onError,
      onEnded,
      onProgress,
    },
    ref,
  ) {
    const videoId = extractYouTubeId(url);

    // Store the native YouTube player instance so seekTo can be called imperatively.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ytPlayerRef = useRef<any>(null);

    // Holds the setInterval ID for progress polling so we can clear it on
    // unmount or when the player is re-initialized, preventing stale intervals.
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        ytPlayerRef.current?.seekTo(seconds, true);
      },
    }));

    // Clear the progress polling interval whenever the component unmounts.
    useEffect(() => {
      return () => {
        if (progressIntervalRef.current !== null) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }, []);

    if (!videoId) {
      console.error("Invalid YouTube URL or ID:", url);
      return (
        <div
          className={`flex aspect-video w-full items-center justify-center bg-gray-900 text-white ${className}`}
        >
          <p>Invalid video URL</p>
        </div>
      );
    }

    const opts: YouTubeProps["opts"] = {
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: playing ? 1 : 0,
        controls: controls ? 1 : 0,
        mute: muted ? 1 : 0,
        loop: loop ? 1 : 0,
        playlist: loop ? videoId : undefined, // Required for loop to work
        rel: 0, // Don't show related videos from other channels
        modestbranding: 1, // Minimal YouTube branding
      },
    };

    const handleReady = (event: YouTubeEvent) => {
      ytPlayerRef.current = event.target;
      onReady?.();

      // Set up progress tracking if callback provided.
      // Clear any previously-running interval first (e.g. player re-init).
      if (onProgress) {
        const player = event.target;
        if (progressIntervalRef.current !== null) {
          clearInterval(progressIntervalRef.current);
        }
        progressIntervalRef.current = setInterval(() => {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          if (duration > 0) {
            onProgress({
              played: currentTime / duration,
              playedSeconds: currentTime,
            });
          }
        }, 1000);
      }
    };

    const handleEnd = () => {
      // Clean up progress interval when playback ends naturally.
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      onEnded?.();
    };

    const handleError = (event: YouTubeEvent) => {
      console.error("YouTube player error:", event.data);
      onError?.(event.data);
    };

    return (
      <div className={`aspect-video w-full bg-gray-900 ${className}`}>
        <YouTube
          className="h-full w-full"
          videoId={videoId}
          opts={opts}
          onReady={handleReady}
          onEnd={handleEnd}
          onError={handleError}
          iframeClassName="h-full w-full"
        />
      </div>
    );
  },
);
