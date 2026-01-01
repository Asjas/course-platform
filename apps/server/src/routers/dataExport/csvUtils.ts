/**
 * CSV utility functions for safe CSV generation
 * Implements RFC 4180 CSV standards and prevents CSV injection
 */

/**
 * Sanitize a CSV cell value to prevent CSV injection attacks
 * Prepends dangerous characters with a single quote to treat them as text
 */
function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check for CSV injection characters: =, +, -, @, tab, carriage return
  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
  const firstChar = stringValue.charAt(0);

  if (dangerousChars.includes(firstChar)) {
    // Prepend with single quote to treat as text
    return "'" + stringValue;
  }

  return stringValue;
}

/**
 * Escape a CSV cell value according to RFC 4180
 * Handles commas, quotes, and newlines
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const sanitized = sanitizeCsvValue(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    sanitized.includes(",") ||
    sanitized.includes('"') ||
    sanitized.includes("\n") ||
    sanitized.includes("\r")
  ) {
    // Escape internal quotes by doubling them
    const escaped = sanitized.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return sanitized;
}

/**
 * Convert an array of values to a CSV row
 */
export function createCsvRow(values: unknown[]): string {
  return values.map((value) => escapeCsvValue(value)).join(",");
}

/**
 * Create a CSV section with header and rows
 */
export function createCsvSection(
  sectionTitle: string,
  headers: string[],
  rows: unknown[][],
): string[] {
  const sections: string[] = [];

  if (rows.length === 0) {
    return sections;
  }

  sections.push(`### ${sectionTitle}`);
  sections.push(createCsvRow(headers));

  rows.forEach((row) => {
    sections.push(createCsvRow(row));
  });

  sections.push("");

  return sections;
}
