import { describe, expect, it } from "vitest";
import {
  type TranscriptCue,
  type TranscriptData,
  buildParagraphs,
  buildTranscriptData,
  checkTranscriptEligibility,
  findActiveCueIndex,
  formatCueTime,
  parseVtt,
  parseVttTimestamp,
  searchTranscript,
  validateTranscriptData,
} from "~/lib/transcript";

// ---------------------------------------------------------------------------
// parseVttTimestamp
// ---------------------------------------------------------------------------

describe("parseVttTimestamp", () => {
  it("parses HH:MM:SS.mmm", () => {
    expect(parseVttTimestamp("00:01:30.500")).toBe(90_500);
  });

  it("parses MM:SS.mmm without hour component", () => {
    expect(parseVttTimestamp("01:30.500")).toBe(90_500);
  });

  it("parses HH:MM:SS.mmm with H > 0", () => {
    expect(parseVttTimestamp("01:00:00.000")).toBe(3_600_000);
  });

  it("pads single-digit milliseconds to 3 digits", () => {
    // "00:00:01.5" => 1500ms
    expect(parseVttTimestamp("00:00:01.5")).toBe(1_500);
  });

  it("pads two-digit milliseconds to 3 digits", () => {
    // "00:00:01.50" => 1500ms
    expect(parseVttTimestamp("00:00:01.50")).toBe(1_500);
  });

  it("parses zero timestamp", () => {
    expect(parseVttTimestamp("00:00:00.000")).toBe(0);
  });

  it("returns null for malformed input", () => {
    expect(parseVttTimestamp("invalid")).toBeNull();
    expect(parseVttTimestamp("00:60:00.000")).toBeNull(); // minutes > 59
    expect(parseVttTimestamp("00:00:60.000")).toBeNull(); // seconds > 59
    expect(parseVttTimestamp("")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseVttTimestamp("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseVtt
// ---------------------------------------------------------------------------

const SIMPLE_VTT = `WEBVTT

00:00:01.000 --> 00:00:03.500
Welcome to the lesson.

00:00:04.000 --> 00:00:07.000
Today we will cover Fastify basics.

00:00:08.000 --> 00:00:10.000
Let's get started.
`;

describe("parseVtt — valid VTT", () => {
  it("returns three cues from a simple VTT string", () => {
    const { cues, warnings } = parseVtt(SIMPLE_VTT);
    expect(cues).toHaveLength(3);
    expect(warnings).toHaveLength(0);
  });

  it("sets startMs and endMs correctly", () => {
    const { cues } = parseVtt(SIMPLE_VTT);
    expect(cues[0].startMs).toBe(1_000);
    expect(cues[0].endMs).toBe(3_500);
  });

  it("sets text content", () => {
    const { cues } = parseVtt(SIMPLE_VTT);
    expect(cues[0].text).toBe("Welcome to the lesson.");
    expect(cues[1].text).toBe("Today we will cover Fastify basics.");
  });

  it("assigns sequential numeric ids when cue has no id", () => {
    const { cues } = parseVtt(SIMPLE_VTT);
    expect(cues[0].id).toBe("0");
    expect(cues[1].id).toBe("1");
  });
});

describe("parseVtt — cue identifiers", () => {
  const VTT_WITH_IDS = `WEBVTT

cue-1
00:00:01.000 --> 00:00:03.000
First cue with id.

cue-2
00:00:04.000 --> 00:00:06.000
Second cue with id.
`;

  it("uses explicit cue ids when present", () => {
    const { cues } = parseVtt(VTT_WITH_IDS);
    expect(cues[0].id).toBe("cue-1");
    expect(cues[1].id).toBe("cue-2");
  });
});

describe("parseVtt — HTML tag stripping", () => {
  const VTT_WITH_TAGS = `WEBVTT

00:00:01.000 --> 00:00:03.000
<b>Hello</b>, <i>world</i>.

00:00:04.000 --> 00:00:06.000
<c.colorBlue>Colored text</c>
`;

  it("strips HTML tags from cue text", () => {
    const { cues } = parseVtt(VTT_WITH_TAGS);
    expect(cues[0].text).toBe("Hello, world.");
    expect(cues[1].text).toBe("Colored text");
  });
});

describe("parseVtt — speaker tags", () => {
  const VTT_WITH_SPEAKERS = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>Good morning everyone.

00:00:04.000 --> 00:00:06.000
<v Bob>Good morning Alice.
`;

  it("extracts speaker from <v Name> tags", () => {
    const { cues } = parseVtt(VTT_WITH_SPEAKERS);
    expect(cues[0].speaker).toBe("Alice");
    expect(cues[1].speaker).toBe("Bob");
  });

  it("strips the <v> tag from text", () => {
    const { cues } = parseVtt(VTT_WITH_SPEAKERS);
    expect(cues[0].text).toBe("Good morning everyone.");
    expect(cues[1].text).toBe("Good morning Alice.");
  });
});

describe("parseVtt — malformed timestamps", () => {
  const VTT_BAD_START = `WEBVTT

BADTIME --> 00:00:03.000
Cue with bad start time.

00:00:04.000 --> 00:00:06.000
Valid cue.
`;

  it("skips cues with malformed start timestamps and records a warning", () => {
    const { cues, warnings } = parseVtt(VTT_BAD_START);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe("Valid cue.");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain("start timestamp");
  });

  const VTT_BAD_END = `WEBVTT

00:00:01.000 --> BADTIME
Cue with bad end time.

00:00:04.000 --> 00:00:06.000
Valid cue.
`;

  it("skips cues with malformed end timestamps and records a warning", () => {
    const { cues, warnings } = parseVtt(VTT_BAD_END);
    expect(cues).toHaveLength(1);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain("end timestamp");
  });
});

describe("parseVtt — overlapping/reversed cues", () => {
  const VTT_END_BEFORE_START = `WEBVTT

00:00:05.000 --> 00:00:01.000
End before start.

00:00:06.000 --> 00:00:09.000
Normal cue.
`;

  it("clamps reversed cue end time to start time and adds a warning", () => {
    const { cues, warnings } = parseVtt(VTT_END_BEFORE_START);
    // Both cues should be present but first cue should have end clamped
    expect(cues[0].endMs).toBe(cues[0].startMs);
    expect(warnings.some((w) => w.message.includes("before start"))).toBe(true);
  });
});

describe("parseVtt — NOTE and STYLE blocks", () => {
  const VTT_WITH_NOTES = `WEBVTT

NOTE This is a comment
and it spans two lines.

00:00:01.000 --> 00:00:03.000
Cue after note.

STYLE
::cue { color: green; }

00:00:04.000 --> 00:00:06.000
Cue after style.
`;

  it("skips NOTE and STYLE blocks entirely", () => {
    const { cues } = parseVtt(VTT_WITH_NOTES);
    expect(cues).toHaveLength(2);
    expect(cues[0].text).toBe("Cue after note.");
    expect(cues[1].text).toBe("Cue after style.");
  });
});

describe("parseVtt — WEBVTT header", () => {
  it("records a warning when WEBVTT header is missing", () => {
    const vttNoHeader = `00:00:01.000 --> 00:00:03.000
Some cue.
`;
    const { warnings } = parseVtt(vttNoHeader);
    expect(warnings.some((w) => w.message.includes("WEBVTT header"))).toBe(
      true,
    );
  });
});

describe("parseVtt — multi-line cue text", () => {
  const VTT_MULTILINE = `WEBVTT

00:00:01.000 --> 00:00:03.000
Line one.
Line two.
`;

  it("joins multi-line cue text with a newline", () => {
    const { cues } = parseVtt(VTT_MULTILINE);
    expect(cues[0].text).toBe("Line one.\nLine two.");
  });
});

describe("parseVtt — cue settings", () => {
  const VTT_WITH_SETTINGS = `WEBVTT

00:00:01.000 --> 00:00:03.500 position:50% align:center
Cue with position settings.
`;

  it("ignores cue settings on the timing line", () => {
    const { cues, warnings } = parseVtt(VTT_WITH_SETTINGS);
    expect(cues).toHaveLength(1);
    expect(cues[0].startMs).toBe(1_000);
    expect(cues[0].endMs).toBe(3_500);
    expect(warnings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildTranscriptData
// ---------------------------------------------------------------------------

describe("buildTranscriptData", () => {
  const SAMPLE_VTT = `WEBVTT

00:00:01.000 --> 00:00:03.000
Hello world.
`;

  it("builds TranscriptData from parse result", () => {
    const result = parseVtt(SAMPLE_VTT);
    const data = buildTranscriptData(result, {
      language: "en",
      source: "manual",
    });
    expect(data.version).toBe(1);
    expect(data.language).toBe("en");
    expect(data.source).toBe("manual");
    expect(data.cues).toHaveLength(1);
    expect(data.cueCount).toBe(1);
    expect(data.durationMs).toBe(3_000);
    expect(data.isAutoGenerated).toBe(false);
  });

  it("uses defaults when options are omitted", () => {
    const result = parseVtt(SAMPLE_VTT);
    const data = buildTranscriptData(result);
    expect(data.language).toBe("en");
    expect(data.source).toBe("manual");
    expect(data.isAutoGenerated).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildParagraphs
// ---------------------------------------------------------------------------

function makeCue(
  id: string,
  startMs: number,
  endMs: number,
  text: string,
  speaker?: string,
): TranscriptCue {
  return { id, startMs, endMs, text, ...(speaker ? { speaker } : {}) };
}

describe("buildParagraphs", () => {
  it("returns empty array for empty cue list", () => {
    expect(buildParagraphs([])).toHaveLength(0);
  });

  it("returns single paragraph for a single cue", () => {
    const cues = [makeCue("0", 0, 3000, "Hello world.")];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].text).toBe("Hello world.");
    expect(paragraphs[0].startMs).toBe(0);
    expect(paragraphs[0].endMs).toBe(3000);
  });

  it("merges consecutive cues with small gaps into a single paragraph", () => {
    const cues = [
      makeCue("0", 0, 1000, "Hello"),
      makeCue("1", 1200, 2000, "world"),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].text).toBe("Hello world");
  });

  it("splits on gap >= 2500 ms between cues", () => {
    const cues = [
      makeCue("0", 0, 1000, "Sentence one."),
      makeCue("1", 4000, 6000, "Sentence two after a long pause."),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].text).toBe("Sentence one.");
    expect(paragraphs[1].text).toBe("Sentence two after a long pause.");
  });

  it("does NOT split on a gap of exactly 2499 ms", () => {
    const cues = [
      makeCue("0", 0, 1000, "First."),
      makeCue("1", 3499, 5000, "Second."),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(1);
  });

  it("splits on speaker change", () => {
    const cues = [
      makeCue("0", 0, 2000, "Good morning.", "Alice"),
      makeCue("1", 2100, 4000, "Good morning Alice.", "Bob"),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].speaker).toBe("Alice");
    expect(paragraphs[1].speaker).toBe("Bob");
  });

  it("sets speaker only when all cues in paragraph share the same speaker", () => {
    const cues = [
      makeCue("0", 0, 1000, "Hello.", "Alice"),
      makeCue("1", 1100, 2000, "World.", "Alice"),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].speaker).toBe("Alice");
  });

  it("splits when accumulated text exceeds 600 chars", () => {
    // Create 6 cues, each with ~170 chars of text.
    // After 3 cues the accumulated text (3*170 + 2 spaces = 512) is still under
    // 600, but after 4 cues it reaches ~683 chars which exceeds the limit,
    // causing a paragraph break before cue 4.
    const longText = "This is a fairly long sentence that takes up some space. "
      .repeat(3)
      .trim();
    const cues = Array.from({ length: 6 }, (_, i) =>
      makeCue(String(i), i * 1000, (i + 1) * 1000, longText),
    );
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs.length).toBeGreaterThan(1);
  });

  it("records correct firstCueIndex and lastCueIndex", () => {
    const cues = [
      makeCue("0", 0, 1000, "A."),
      makeCue("1", 4000, 5000, "B."), // gap > 2.5s → new paragraph
      makeCue("2", 5100, 6000, "C."),
    ];
    const paragraphs = buildParagraphs(cues);
    expect(paragraphs[0].firstCueIndex).toBe(0);
    expect(paragraphs[0].lastCueIndex).toBe(0);
    expect(paragraphs[1].firstCueIndex).toBe(1);
    expect(paragraphs[1].lastCueIndex).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// searchTranscript
// ---------------------------------------------------------------------------

const SEARCH_TRANSCRIPT: TranscriptData = {
  version: 1,
  language: "en",
  source: "manual",
  isAutoGenerated: false,
  cueCount: 3,
  durationMs: 10_000,
  cues: [
    { id: "0", startMs: 0, endMs: 3000, text: "Welcome to the lesson." },
    { id: "1", startMs: 4000, endMs: 7000, text: "Today we cover Fastify." },
    { id: "2", startMs: 8000, endMs: 10000, text: "Let's build an API." },
  ],
};

describe("searchTranscript", () => {
  it("returns empty matches for empty query", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "");
    expect(result.matches).toHaveLength(0);
  });

  it("returns empty matches for whitespace-only query", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "   ");
    expect(result.matches).toHaveLength(0);
  });

  it("finds a single matching cue", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "Fastify");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].cueIndex).toBe(1);
  });

  it("is case-insensitive", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "fastify");
    expect(result.matches).toHaveLength(1);
  });

  it("finds multiple matching cues", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "e");
    // "Welcome", "lesson", "Today", "we", "cover", "Let's", "build"
    expect(result.matches.length).toBeGreaterThan(1);
  });

  it("returns no matches for a non-existent term", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "xyz-no-match");
    expect(result.matches).toHaveLength(0);
  });

  it("includes matchIndex pointing to the start of the match", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "Fastify");
    expect(result.matches[0].matchIndex).toBe(
      "Today we cover Fastify.".toLowerCase().indexOf("fastify"),
    );
  });

  it("returns the trimmed query string", () => {
    const result = searchTranscript(SEARCH_TRANSCRIPT, "  Fastify  ");
    expect(result.query).toBe("Fastify");
  });
});

// ---------------------------------------------------------------------------
// validateTranscriptData
// ---------------------------------------------------------------------------

describe("validateTranscriptData", () => {
  const VALID_PAYLOAD: TranscriptData = {
    version: 1,
    language: "en",
    source: "manual",
    isAutoGenerated: false,
    cueCount: 1,
    durationMs: 3000,
    cues: [{ id: "0", startMs: 0, endMs: 3000, text: "Hello." }],
  };

  it("accepts a well-formed TranscriptData payload", () => {
    expect(validateTranscriptData(VALID_PAYLOAD)).not.toBeNull();
  });

  it("returns null for null input", () => {
    expect(validateTranscriptData(null)).toBeNull();
  });

  it("returns null for old-format segments payload", () => {
    expect(
      validateTranscriptData({ segments: [{ start: 0, end: 10, text: "Hi" }] }),
    ).toBeNull();
  });

  it("returns null when version is not 1", () => {
    expect(validateTranscriptData({ ...VALID_PAYLOAD, version: 2 })).toBeNull();
  });

  it("returns null when cues array is missing", () => {
    const payload: Record<string, unknown> = { ...VALID_PAYLOAD };
    delete payload["cues"];
    expect(validateTranscriptData(payload)).toBeNull();
  });

  it("returns null when a cue has negative startMs", () => {
    const bad = {
      ...VALID_PAYLOAD,
      cues: [{ id: "0", startMs: -1, endMs: 3000, text: "Bad." }],
    };
    expect(validateTranscriptData(bad)).toBeNull();
  });

  it("accepts optional fields (sourceProvider, sourceTrackId, lastFetchedAt)", () => {
    const withOptionals = {
      ...VALID_PAYLOAD,
      sourceProvider: "youtube",
      sourceTrackId: "yt-track-1",
      lastFetchedAt: "2026-04-01T00:00:00.000Z",
    };
    expect(validateTranscriptData(withOptionals)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkTranscriptEligibility
// ---------------------------------------------------------------------------

describe("checkTranscriptEligibility", () => {
  const VALID_TRANSCRIPT: TranscriptData = {
    version: 1,
    language: "en",
    source: "manual",
    isAutoGenerated: false,
    cueCount: 1,
    durationMs: 3000,
    cues: [{ id: "0", startMs: 0, endMs: 3000, text: "Hello." }],
  };

  it("is always eligible for non-video lessons", () => {
    expect(checkTranscriptEligibility(null, false)).toEqual({ eligible: true });
    expect(checkTranscriptEligibility({}, false)).toEqual({ eligible: true });
    expect(checkTranscriptEligibility(undefined, false)).toEqual({
      eligible: true,
    });
  });

  it("is eligible for a video lesson with valid transcript", () => {
    expect(checkTranscriptEligibility(VALID_TRANSCRIPT, true)).toEqual({
      eligible: true,
    });
  });

  it("returns missing reason for null transcription on a video lesson", () => {
    expect(checkTranscriptEligibility(null, true)).toEqual({
      eligible: false,
      reason: "missing",
    });
  });

  it("returns missing reason for undefined transcription on a video lesson", () => {
    expect(checkTranscriptEligibility(undefined, true)).toEqual({
      eligible: false,
      reason: "missing",
    });
  });

  it("returns invalid_schema for old-format segments payload", () => {
    expect(
      checkTranscriptEligibility(
        { segments: [{ start: 0, end: 10, text: "Hi" }] },
        true,
      ),
    ).toEqual({ eligible: false, reason: "invalid_schema" });
  });

  it("returns no_cues for a valid-schema transcript with empty cue array", () => {
    const empty: TranscriptData = {
      ...VALID_TRANSCRIPT,
      cues: [],
      cueCount: 0,
      durationMs: 0,
    };
    expect(checkTranscriptEligibility(empty, true)).toEqual({
      eligible: false,
      reason: "no_cues",
    });
  });
});

// ---------------------------------------------------------------------------
// formatCueTime
// ---------------------------------------------------------------------------

describe("formatCueTime", () => {
  it("formats sub-minute durations as M:SS", () => {
    expect(formatCueTime(5_000)).toBe("0:05");
    expect(formatCueTime(59_000)).toBe("0:59");
  });

  it("formats minute-range durations as M:SS", () => {
    expect(formatCueTime(90_000)).toBe("1:30");
    expect(formatCueTime(3599_000)).toBe("59:59");
  });

  it("formats hour-range durations as H:MM:SS", () => {
    expect(formatCueTime(3_600_000)).toBe("1:00:00");
    expect(formatCueTime(3_661_000)).toBe("1:01:01");
  });

  it("formats zero as 0:00", () => {
    expect(formatCueTime(0)).toBe("0:00");
  });
});

// ---------------------------------------------------------------------------
// findActiveCueIndex
// ---------------------------------------------------------------------------

describe("findActiveCueIndex", () => {
  const cues: TranscriptCue[] = [
    { id: "0", startMs: 0, endMs: 3000, text: "A." },
    { id: "1", startMs: 4000, endMs: 7000, text: "B." },
    { id: "2", startMs: 8000, endMs: 10000, text: "C." },
  ];

  it("returns the index of the cue that spans the current position", () => {
    expect(findActiveCueIndex(cues, 0)).toBe(0);
    expect(findActiveCueIndex(cues, 2999)).toBe(0);
    expect(findActiveCueIndex(cues, 4000)).toBe(1);
    expect(findActiveCueIndex(cues, 8500)).toBe(2);
  });

  it("returns -1 when no cue spans the current position", () => {
    expect(findActiveCueIndex(cues, 3500)).toBe(-1); // gap between cue 0 and 1
    expect(findActiveCueIndex(cues, 11000)).toBe(-1); // after last cue
  });

  it("returns -1 for an empty cue list", () => {
    expect(findActiveCueIndex([], 5000)).toBe(-1);
  });

  it("returns -1 for a position exactly at endMs (exclusive boundary)", () => {
    // endMs is exclusive: position === endMs should NOT match
    expect(findActiveCueIndex(cues, 3000)).toBe(-1);
  });
});
