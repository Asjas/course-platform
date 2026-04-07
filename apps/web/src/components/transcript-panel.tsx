/**
 * TranscriptPanel — learner-facing transcript display component.
 *
 * Phase 3 capabilities (complete):
 *   - Validates the raw transcription JSON from the lesson.
 *   - Timestamp mode: renders each cue with a human-readable timestamp.
 *   - Paragraph mode: groups cues into readable paragraphs.
 *   - Cue click → calls `onSeek` so the video player seeks to that position.
 *   - Active cue highlight based on current playback time.
 *   - Auto-scroll: active cue scrolls into view while `followPlayback` is true.
 *   - Follow-playback toggle: disable auto-scroll when manually browsing.
 *   - Inline search: cue-based text search with prev / next navigation and
 *     keyboard shortcuts (Enter = next, Shift+Enter = prev, Escape = clear).
 *   - Empty/invalid state: renders a clear "no transcript" message.
 */
import { useEffect, useRef, useState } from "react";
import {
  buildParagraphs,
  findActiveCueIndex,
  formatCueTime,
  resolveTranscript,
  searchTranscript,
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
   * When provided, the active cue is highlighted and auto-scrolled.
   */
  currentTimeSeconds?: number;
  /**
   * Called when the user clicks a cue or a search match.
   * The parent should seek the video player to `seconds`.
   */
  onSeek?: (seconds: number) => void;
}

// ---------------------------------------------------------------------------
// Mode toggle type
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
  onSeek,
}: TranscriptPanelProps) {
  const [mode, setMode] = useState<ViewMode>("timestamp");
  const [followPlayback, setFollowPlayback] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const cueListRef = useRef<HTMLOListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { eligibility, data } = resolveTranscript(transcription, hasVideo);

  // ---------------------------------------------------------------------------
  // Derived data — computed before hooks so hooks are never called after a
  // conditional return (Rules of Hooks).
  // ---------------------------------------------------------------------------

  const positionMs =
    currentTimeSeconds !== undefined ? currentTimeSeconds * 1000 : -1;
  const activeCueIndex =
    data && positionMs >= 0 ? findActiveCueIndex(data.cues, positionMs) : -1;

  // ---------------------------------------------------------------------------
  // Auto-scroll active cue
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!followPlayback || activeCueIndex < 0 || mode !== "timestamp") return;
    const el = cueListRef.current?.querySelector<HTMLElement>(
      `[data-cue-index="${activeCueIndex}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeCueIndex, followPlayback, mode]);

  // Focus search input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

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
  // Remaining derived data (requires data to be non-null)
  // ---------------------------------------------------------------------------

  const paragraphs = mode === "paragraph" ? buildParagraphs(data.cues) : [];

  const searchResult = searchQuery.trim()
    ? searchTranscript(data, searchQuery)
    : null;
  const totalMatches = searchResult?.matches.length ?? 0;
  // Clamp current match index to valid range
  const clampedMatchIndex =
    totalMatches > 0 ? Math.min(searchMatchIndex, totalMatches - 1) : 0;
  const activeMatch =
    totalMatches > 0
      ? (searchResult?.matches[clampedMatchIndex] ?? null)
      : null;

  // ---------------------------------------------------------------------------
  // Search navigation helpers
  // ---------------------------------------------------------------------------

  function goToNextMatch() {
    if (totalMatches === 0) return;
    const next = (clampedMatchIndex + 1) % totalMatches;
    setSearchMatchIndex(next);
    seekToMatchAtIndex(next);
  }

  function goToPrevMatch() {
    if (totalMatches === 0) return;
    const prev = (clampedMatchIndex - 1 + totalMatches) % totalMatches;
    setSearchMatchIndex(prev);
    seekToMatchAtIndex(prev);
  }

  function seekToMatchAtIndex(idx: number) {
    if (!searchResult || !onSeek) return;
    const match = searchResult.matches[idx];
    if (match) {
      onSeek(match.cue.startMs / 1000);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      handleCloseSearch();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevMatch();
      } else {
        goToNextMatch();
      }
    }
  }

  function handleCloseSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchMatchIndex(0);
  }

  // ---------------------------------------------------------------------------
  // Cue / paragraph click → seek
  // ---------------------------------------------------------------------------

  function handleCueClick(startMs: number) {
    if (!onSeek) return;
    // Pause follow-playback so the view doesn't immediately jump away
    setFollowPlayback(false);
    onSeek(startMs / 1000);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      className="flex h-full flex-col"
      aria-label="Lesson transcript"
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-1 border-b border-gray-200 p-3 dark:border-gray-700"
        role="group"
        aria-label="Transcript controls"
      >
        {/* Mode toggle */}
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

        {/* Follow playback toggle — timestamp mode only */}
        {mode === "timestamp" && (
          <button
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              followPlayback
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            )}
            aria-pressed={followPlayback}
            onClick={() => setFollowPlayback((v) => !v)}
            type="button"
            title="Auto-scroll transcript to match video playback position"
          >
            Follow
          </button>
        )}

        {/* Search toggle */}
        <button
          className={cn(
            "rounded px-3 py-1 text-xs font-medium transition-colors",
            searchOpen
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
          )}
          aria-pressed={searchOpen}
          aria-label="Toggle transcript search"
          onClick={() => {
            if (searchOpen) {
              handleCloseSearch();
            } else {
              setSearchOpen(true);
            }
          }}
          type="button"
        >
          Search
        </button>

        {/* Source badge */}
        <span
          className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          title={`Transcript source: ${data.isAutoGenerated ? "auto-generated" : "manual"}`}
        >
          {data.isAutoGenerated ? "Auto" : "Manual"}
        </span>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700"
          role="search"
          aria-label="Transcript search"
        >
          <input
            className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            ref={searchInputRef}
            type="search"
            placeholder="Search transcript…"
            aria-label="Transcript search query"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchMatchIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            aria-describedby="transcript-search-status"
          />

          {/* Match counter */}
          <span
            className="shrink-0 text-xs text-gray-500 tabular-nums dark:text-gray-400"
            id="transcript-search-status"
            aria-live="polite"
            aria-atomic="true"
          >
            {searchQuery.trim()
              ? totalMatches > 0
                ? `${clampedMatchIndex + 1} / ${totalMatches}`
                : "0 results"
              : null}
          </span>

          {/* Prev */}
          <button
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            disabled={totalMatches === 0}
            onClick={goToPrevMatch}
            type="button"
            aria-label="Previous match"
            title="Previous match (Shift+Enter)"
          >
            ▲
          </button>
          {/* Next */}
          <button
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            disabled={totalMatches === 0}
            onClick={goToNextMatch}
            type="button"
            aria-label="Next match"
            title="Next match (Enter)"
          >
            ▼
          </button>

          {/* Close */}
          <button
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            onClick={handleCloseSearch}
            type="button"
            aria-label="Close search"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Cue list (timestamp mode) ────────────────────────────────────── */}
      {mode === "timestamp" && (
        <ol
          className="grow overflow-y-auto"
          ref={cueListRef}
          aria-label="Transcript cues"
        >
          {data.cues.map((cue, idx) => {
            const isActive = idx === activeCueIndex;
            const isCurrentSearchMatch =
              activeMatch !== null && activeMatch.cueIndex === idx;
            const isAnySearchMatch =
              searchResult !== null &&
              searchResult.matches.some((m) => m.cueIndex === idx);

            return (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="button" is set conditionally when onSeek is provided
              <li
                className={cn(
                  "border-b border-gray-100 px-4 py-2 dark:border-gray-700/50",
                  onSeek ? "cursor-pointer" : "",
                  isCurrentSearchMatch
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : isActive
                      ? "bg-green-50 dark:bg-green-900/20"
                      : isAnySearchMatch
                        ? "bg-amber-50/60 dark:bg-amber-900/10"
                        : onSeek
                          ? "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          : "",
                )}
                data-cue-index={idx}
                key={`${cue.id}-${cue.startMs}-${idx}`}
                aria-current={isActive ? "true" : undefined}
                onClick={onSeek ? () => handleCueClick(cue.startMs) : undefined}
                role={onSeek ? "button" : undefined}
                tabIndex={onSeek ? 0 : undefined}
                onKeyDown={
                  onSeek
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCueClick(cue.startMs);
                        }
                      }
                    : undefined
                }
              >
                <div className="flex gap-3">
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
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* ── Paragraph list ───────────────────────────────────────────────── */}
      {mode === "paragraph" && (
        <ol
          className="grow overflow-y-auto px-4 py-3"
          aria-label="Transcript paragraphs"
        >
          {paragraphs.map((para) => {
            const isCurrentSearchMatch =
              activeMatch !== null &&
              activeMatch.cueIndex >= para.firstCueIndex &&
              activeMatch.cueIndex <= para.lastCueIndex;

            return (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="button" is set conditionally when onSeek is provided
              <li
                className={cn(
                  "mb-4 rounded p-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300",
                  onSeek
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    : "",
                  isCurrentSearchMatch
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "",
                )}
                key={`${para.startMs}-${para.endMs}`}
                onClick={
                  onSeek ? () => handleCueClick(para.startMs) : undefined
                }
                role={onSeek ? "button" : undefined}
                tabIndex={onSeek ? 0 : undefined}
                onKeyDown={
                  onSeek
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCueClick(para.startMs);
                        }
                      }
                    : undefined
                }
              >
                {para.speaker && (
                  <span className="mr-1 font-medium text-gray-900 dark:text-white">
                    {para.speaker}:
                  </span>
                )}
                {para.text}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
