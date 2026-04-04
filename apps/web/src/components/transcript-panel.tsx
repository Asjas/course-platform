/**
 * TranscriptPanel — learner-facing transcript display component.
 *
 * Phase 1 capabilities:
 *   - Validates the raw transcription JSON from the lesson.
 *   - Timestamp mode: renders each cue with a human-readable timestamp.
 *   - Paragraph mode: groups cues into readable paragraphs.
 *   - Empty/invalid state: renders a clear "no transcript" message.
 *
 * Phase 3 will add: video seek on cue click, active cue highlight,
 * follow-playback toggle, and inline search.
 */
import { useState } from "react";
import {
  buildParagraphs,
  findActiveCueIndex,
  formatCueTime,
  resolveTranscript,
} from "~/lib/transcript";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TranscriptPanelProps {
  /** Raw value of `lesson.transcription` (may be any shape from the DB). */
  transcription: unknown;
  /** Whether the lesson has a video (affects validation messaging). */
  hasVideo?: boolean;
  /**
   * Current video playback position in seconds.
   * When provided, the active cue is highlighted.
   * Phase 1 — visual-only (no auto-scroll or seek callback yet).
   */
  currentTimeSeconds?: number;
}

// ---------------------------------------------------------------------------
// Mode toggle
// ---------------------------------------------------------------------------

type ViewMode = "timestamp" | "paragraph";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Display a validated transcript for a lesson.
 *
 * Built with accessibility in mind, but manual review is still recommended.
 * Run against tools like Accessibility Insights for comprehensive checks.
 */
export function TranscriptPanel({
  transcription,
  hasVideo = true,
  currentTimeSeconds,
}: TranscriptPanelProps) {
  const [mode, setMode] = useState<ViewMode>("timestamp");

  const { eligibility, data } = resolveTranscript(transcription, hasVideo);

  // ---------------------------------------------------------------------------
  // Empty / invalid states
  // ---------------------------------------------------------------------------

  if (!eligibility.eligible) {
    const message =
      eligibility.reason === "missing"
        ? "No transcript has been added for this lesson yet."
        : eligibility.reason === "no_cues"
          ? "The transcript for this lesson is empty."
          : "The transcript data for this lesson is not yet in the updated format.";

    return (
      <div
        className="flex h-full items-center justify-center p-6 text-center"
        role="status"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    );
  }

  // hasVideo = false lands here as eligible but data may not exist in old format
  if (!data) {
    return (
      <div
        className="flex h-full items-center justify-center p-6 text-center"
        role="status"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No transcript has been added for this lesson yet.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const positionMs =
    currentTimeSeconds !== undefined ? currentTimeSeconds * 1000 : -1;
  const activeCueIndex =
    positionMs >= 0 ? findActiveCueIndex(data.cues, positionMs) : -1;

  const paragraphs = mode === "paragraph" ? buildParagraphs(data.cues) : [];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      className="flex h-full flex-col"
      aria-label="Lesson transcript"
    >
      {/* Mode toggle */}
      <div
        className="flex shrink-0 items-center gap-1 border-b border-gray-200 p-3 dark:border-gray-700"
        role="group"
        aria-label="Transcript display mode"
      >
        <button
          className={cn(
            "rounded px-3 py-1 text-xs font-medium transition-colors",
            mode === "timestamp"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
          aria-pressed={mode === "timestamp"}
          onClick={() => setMode("timestamp")}
          type="button"
        >
          Timestamps
        </button>
        <button
          className={cn(
            "rounded px-3 py-1 text-xs font-medium transition-colors",
            mode === "paragraph"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
          aria-pressed={mode === "paragraph"}
          onClick={() => setMode("paragraph")}
          type="button"
        >
          Paragraph
        </button>

        {/* Source badge */}
        <span
          className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          title={`Transcript source: ${data.isAutoGenerated ? "auto-generated" : "manual"}`}
        >
          {data.isAutoGenerated ? "Auto" : "Manual"}
        </span>
      </div>

      {/* Cue list */}
      {mode === "timestamp" && (
        <ol
          className="grow overflow-y-auto"
          aria-label="Transcript cues"
        >
          {data.cues.map((cue, idx) => {
            const isActive = idx === activeCueIndex;
            return (
              <li
                className={cn(
                  "flex gap-3 border-b border-gray-100 px-4 py-2 dark:border-gray-700/50",
                  isActive
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/30",
                )}
                key={`${cue.id}-${cue.startMs}-${idx}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className="mt-0.5 shrink-0 font-mono text-xs text-gray-400 tabular-nums dark:text-gray-500"
                  aria-label={`Time: ${formatCueTime(cue.startMs)}`}
                >
                  {formatCueTime(cue.startMs)}
                </span>
                <span className="grow text-sm text-gray-700 dark:text-gray-300">
                  {cue.speaker && (
                    <span className="mr-1 font-medium text-gray-900 dark:text-white">
                      {cue.speaker}:
                    </span>
                  )}
                  {cue.text}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Paragraph list */}
      {mode === "paragraph" && (
        <ol
          className="grow overflow-y-auto px-4 py-3"
          aria-label="Transcript paragraphs"
        >
          {paragraphs.map((para) => (
            <li
              className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              key={`${para.startMs}-${para.endMs}`}
            >
              {para.speaker && (
                <span className="mr-1 font-medium text-gray-900 dark:text-white">
                  {para.speaker}:
                </span>
              )}
              {para.text}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
