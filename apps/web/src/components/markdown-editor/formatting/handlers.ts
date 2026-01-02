import type { FormattingParams } from "../types.js";
import {
  findMarkersAroundCursor,
  findSingleCharMarker,
  getPreviousLine,
  isAtStartOfLine,
} from "./text-utils.js";

/**
 * Insert header markdown (### )
 */
export function insertHeader({ textarea, onChange }: FormattingParams): void {
  const cursorPos = textarea.selectionStart;
  const headerMarkdown = "### ";

  onChange(
    (prev) => prev.slice(0, cursorPos) + headerMarkdown + prev.slice(cursorPos),
  );

  requestAnimationFrame(() => {
    textarea.focus();
    const newPos = cursorPos + headerMarkdown.length;
    textarea.setSelectionRange(newPos, newPos);
  });
}

/**
 * Toggle bold markdown (**text**)
 */
export function toggleBold({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  const result = findMarkersAroundCursor(value, start, end, "**", "**");

  if (
    result.found &&
    result.markerStart !== undefined &&
    result.markerEnd !== undefined
  ) {
    const markerStart = result.markerStart;
    const markerEnd = result.markerEnd;
    const innerText = result.innerText ?? "";

    // Remove bold markdown, keep the inner text
    onChange(
      (prev) => prev.slice(0, markerStart) + innerText + prev.slice(markerEnd),
    );

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = markerStart + innerText.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  } else {
    // Add bold markdown
    const boldMarkdown = `**${selectedText}**`;
    onChange((prev) => prev.slice(0, start) + boldMarkdown + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + 2;
      textarea.setSelectionRange(newPos, newPos);
    });
  }
}

/**
 * Toggle italic markdown (_text_)
 */
export function toggleItalic({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  const result = findSingleCharMarker(value, start, end, "_");

  if (
    result.found &&
    result.markerStart !== undefined &&
    result.markerEnd !== undefined
  ) {
    const markerStart = result.markerStart;
    const markerEnd = result.markerEnd;
    const innerText = result.innerText ?? "";

    // Remove italic markdown, keep the inner text
    onChange(
      (prev) => prev.slice(0, markerStart) + innerText + prev.slice(markerEnd),
    );

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = markerStart + innerText.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  } else {
    // Add italic markdown
    const italicMarkdown = `_${selectedText}_`;
    onChange((prev) => prev.slice(0, start) + italicMarkdown + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + 1;
      textarea.setSelectionRange(newPos, newPos);
    });
  }
}

/**
 * Insert blockquote (> text)
 */
export function insertQuote({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  const atStartOfLine = isAtStartOfLine(value, start);
  const prevLine = getPreviousLine(value, start);

  if (selectedText) {
    // Wrap selected text in blockquote
    const quotedText = selectedText
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");

    const before = atStartOfLine ? "" : "\n";
    const after = end < value.length && value[end] !== "\n" ? "\n\n" : "\n";
    const insertText = before + quotedText + after;

    onChange((prev) => prev.slice(0, start) + insertText + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertText.length,
        start + insertText.length,
      );
    });
  } else {
    // Insert new blockquote
    let insertText = "> ";

    if (prevLine && prevLine.startsWith(">")) {
      insertText = "\n\n> ";
    } else if (!atStartOfLine) {
      insertText = "\n> ";
    }

    onChange((prev) => prev.slice(0, start) + insertText + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + insertText.indexOf("> ") + 2;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }
}

/**
 * Toggle inline code (`text`)
 */
export function toggleCode({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  // Find nearest ` markers
  let startIndex = start;
  let endIndex = end;

  while (startIndex > 0 && value[startIndex - 1] !== "`") {
    startIndex--;
  }

  while (endIndex < value.length && value[endIndex] !== "`") {
    endIndex++;
  }

  // Verify valid ` markers and not part of code block (```)
  const isCode =
    startIndex > 0 &&
    value[startIndex - 1] === "`" &&
    endIndex < value.length &&
    value[endIndex] === "`" &&
    (startIndex - 2 < 0 || value.slice(startIndex - 2, startIndex) !== "``") &&
    (endIndex + 1 >= value.length ||
      value.slice(endIndex, endIndex + 2) !== "``");

  if (isCode) {
    const codeStart = startIndex - 1;
    const codeEnd = endIndex + 1;
    const innerText = value.slice(startIndex, endIndex);

    onChange(
      (prev) => prev.slice(0, codeStart) + innerText + prev.slice(codeEnd),
    );

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = codeStart + innerText.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  } else {
    const codeMarkdown = selectedText ? `\`${selectedText}\`` : `\`\``;
    onChange((prev) => prev.slice(0, start) + codeMarkdown + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + 1;
      textarea.setSelectionRange(
        cursorPos,
        cursorPos + (selectedText ? selectedText.length : 0),
      );
    });
  }
}

/**
 * Insert or toggle link markdown ([text](url))
 */
export function insertLink({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  // Find nearest [text](url) that fully contains the selection
  const findLink = () => {
    let openIdx = start;
    while (openIdx > 0 && value[openIdx - 1] !== "[") openIdx--;
    if (openIdx === 0 || value[openIdx - 1] !== "[") return null;

    const bracketClose = value.indexOf("]", openIdx);
    if (bracketClose === -1) return null;
    if (value[bracketClose + 1] !== "(") return null;

    const parenClose = value.indexOf(")", bracketClose + 2);
    if (parenClose === -1) return null;

    const innerText = value.slice(openIdx, bracketClose);
    const url = value.slice(bracketClose + 2, parenClose);

    const linkStart = openIdx - 1;
    const linkEnd = parenClose + 1;

    const isDefault = innerText === "" && url === "url";

    if (start >= linkStart && end <= linkEnd && isDefault) {
      return { linkStart, linkEnd, isDefault: true };
    }

    return null;
  };

  const link = findLink();

  if (link) {
    onChange(
      (prev) => prev.slice(0, link.linkStart) + prev.slice(link.linkEnd),
    );
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(link.linkStart, link.linkStart);
    });
    return;
  }

  const markdown = selectedText ? `[${selectedText}](url)` : `[](url)`;
  onChange((prev) => prev.slice(0, start) + markdown + prev.slice(end));

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + 1, start + 1);
  });
}

/**
 * Insert bulleted list (- text)
 */
export function insertBulletList({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);

  const atStartOfLine = isAtStartOfLine(value, start);
  const prevLine = getPreviousLine(value, start);

  if (selectedText) {
    const bulletedText = selectedText
      .split("\n")
      .map((line) => `- ${line}`)
      .join("\n");

    const before = atStartOfLine ? "" : "\n";
    const after = end < value.length && value[end] !== "\n" ? "\n\n" : "\n";
    const insertText = before + bulletedText + after;

    onChange((prev) => prev.slice(0, start) + insertText + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertText.length,
        start + insertText.length,
      );
    });
  } else {
    let insertText = "- ";

    if (prevLine && prevLine.startsWith("-")) {
      insertText = "\n\n- ";
    } else if (!atStartOfLine) {
      insertText = "\n- ";
    }

    onChange((prev) => prev.slice(0, start) + insertText + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + insertText.indexOf("- ") + 2;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }
}

/**
 * Insert numbered list (1. text)
 */
export function insertNumberedList({
  textarea,
  value,
  onChange,
}: FormattingParams): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", start);
  const currentLine =
    lineEnd === -1 ? value.slice(lineStart) : value.slice(lineStart, lineEnd);

  const numberMatch = currentLine.match(/^\d+\.\s/);
  const isNumbered = !!numberMatch;

  if (selected) {
    const lines = selected.split("\n");
    const toggled = lines
      .map((l, i) =>
        l.match(/^\d+\.\s/) ? l.replace(/^\d+\.\s/, "") : `${i + 1}. ${l}`,
      )
      .join("\n");

    const before = start === 0 || value[start - 1] === "\n" ? "" : "\n";
    const after = end === value.length || value[end] === "\n" ? "" : "\n";
    const insert = before + toggled + after;

    onChange((prev) => prev.slice(0, start) + insert + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + toggled.length,
      );
    });
  } else if (isNumbered) {
    const removeStart = lineStart;
    const removeEnd = lineStart + numberMatch[0].length;

    onChange(
      (prev) =>
        prev.slice(0, removeStart) +
        prev.slice(removeEnd) +
        prev.slice(lineEnd),
    );

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(removeStart, removeStart);
    });
  } else {
    const insertText =
      start === 0 || value[start - 1] === "\n" ? "1. " : "\n1. ";

    onChange((prev) => prev.slice(0, start) + insertText + prev.slice(end));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + insertText.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }
}
