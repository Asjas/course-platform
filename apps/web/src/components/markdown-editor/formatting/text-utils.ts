/**
 * Text manipulation utilities for markdown formatting
 */

/**
 * Check if cursor is at start of a line
 */
export function isAtStartOfLine(text: string, position: number): boolean {
  return position === 0 || text[position - 1] === "\n";
}

/**
 * Get the previous line content (or current line content up to cursor)
 */
export function getPreviousLine(text: string, position: number): string | null {
  if (position === 0) return null;
  const before = text.slice(0, position);
  const lines = before.split("\n");
  const prevLine = lines[lines.length - 1];
  return prevLine.trim() === "" ? null : prevLine;
}

/**
 * Find markers around cursor for toggle detection (e.g., ** for bold)
 */
export function findMarkersAroundCursor(
  text: string,
  start: number,
  end: number,
  openMarker: string,
  closeMarker: string,
): {
  found: boolean;
  markerStart?: number;
  markerEnd?: number;
  innerText?: string;
} {
  let startIndex = start;
  let endIndex = end;
  const openLen = openMarker.length;
  const closeLen = closeMarker.length;

  // Look backward for opening marker
  while (
    startIndex >= openLen &&
    text.slice(startIndex - openLen, startIndex) !== openMarker
  ) {
    startIndex--;
  }

  // Look forward for closing marker
  while (
    endIndex <= text.length - closeLen &&
    text.slice(endIndex, endIndex + closeLen) !== closeMarker
  ) {
    endIndex++;
  }

  // Verify we found valid markers
  if (
    startIndex >= openLen &&
    text.slice(startIndex - openLen, startIndex) === openMarker &&
    endIndex <= text.length - closeLen &&
    text.slice(endIndex, endIndex + closeLen) === closeMarker
  ) {
    return {
      found: true,
      markerStart: startIndex - openLen,
      markerEnd: endIndex + closeLen,
      innerText: text.slice(startIndex, endIndex),
    };
  }

  return { found: false };
}

/**
 * Find single-char markers (like _ for italic) with additional validation
 */
export function findSingleCharMarker(
  text: string,
  start: number,
  end: number,
  marker: string,
): {
  found: boolean;
  markerStart?: number;
  markerEnd?: number;
  innerText?: string;
} {
  let startIndex = start;
  let endIndex = end;

  // Look backward for opening marker
  while (startIndex >= 1 && text[startIndex - 1] !== marker) {
    startIndex--;
  }

  // Look forward for closing marker
  while (endIndex <= text.length - 1 && text[endIndex] !== marker) {
    endIndex++;
  }

  // Verify we found valid markers and they are not part of a larger sequence
  if (
    startIndex >= 1 &&
    text[startIndex - 1] === marker &&
    endIndex <= text.length - 1 &&
    text[endIndex] === marker &&
    // Ensure not part of double marker (e.g., __ for bold)
    (startIndex - 2 < 0 || text[startIndex - 2] !== marker) &&
    (endIndex + 1 >= text.length || text[endIndex + 1] !== marker)
  ) {
    return {
      found: true,
      markerStart: startIndex - 1,
      markerEnd: endIndex + 1,
      innerText: text.slice(startIndex, endIndex),
    };
  }

  return { found: false };
}
