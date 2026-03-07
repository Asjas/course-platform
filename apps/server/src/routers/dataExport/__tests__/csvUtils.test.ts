import { createCsvRow, createCsvSection } from "../csvUtils.js";
import { describe, expect, test } from "vitest";

describe("createCsvRow", () => {
  test("joins simple values with commas", () => {
    expect(createCsvRow(["a", "b", "c"])).toBe("a,b,c");
  });

  test("handles null values as empty strings", () => {
    expect(createCsvRow([null, "b", null])).toBe(",b,");
  });

  test("handles undefined values as empty strings", () => {
    expect(createCsvRow([undefined, "b"])).toBe(",b");
  });

  test("handles numeric values", () => {
    expect(createCsvRow([1, 2.5, 0])).toBe("1,2.5,0");
  });

  test("handles boolean values", () => {
    expect(createCsvRow([true, false])).toBe("true,false");
  });

  test("wraps values containing commas in quotes", () => {
    expect(createCsvRow(["hello, world"])).toBe('"hello, world"');
  });

  test("wraps values containing double quotes and escapes them", () => {
    expect(createCsvRow(['say "hello"'])).toBe('"say ""hello"""');
  });

  test("wraps values containing newlines in quotes", () => {
    expect(createCsvRow(["line1\nline2"])).toBe('"line1\nline2"');
  });

  test("wraps values containing carriage returns in quotes", () => {
    expect(createCsvRow(["line1\rline2"])).toBe('"line1\rline2"');
  });

  test("handles empty array", () => {
    expect(createCsvRow([])).toBe("");
  });

  test("handles single value", () => {
    expect(createCsvRow(["only"])).toBe("only");
  });

  // CSV injection prevention tests
  test("sanitizes values starting with =", () => {
    expect(createCsvRow(["=CMD()"])).toBe("'=CMD()");
  });

  test("sanitizes values starting with +", () => {
    expect(createCsvRow(["+CMD()"])).toBe("'+CMD()");
  });

  test("sanitizes values starting with -", () => {
    expect(createCsvRow(["-CMD()"])).toBe("'-CMD()");
  });

  test("sanitizes values starting with @", () => {
    expect(createCsvRow(["@SUM(A1)"])).toBe("'@SUM(A1)");
  });

  test("sanitizes values starting with tab character", () => {
    expect(createCsvRow(["\tdata"])).toBe("'\tdata");
  });

  test("sanitizes values starting with carriage return", () => {
    // \r at start triggers sanitization (prepend '), then the \r inside triggers quoting
    expect(createCsvRow(["\rdata"])).toBe('"\'\rdata"');
  });

  test("does not sanitize values starting with safe characters", () => {
    expect(createCsvRow(["hello"])).toBe("hello");
    expect(createCsvRow(["123"])).toBe("123");
  });

  test("handles mixed values with special characters", () => {
    const row = createCsvRow(["name", "=formula", "value, with comma", null]);
    expect(row).toBe('name,\'=formula,"value, with comma",');
  });
});

describe("createCsvSection", () => {
  test("creates section with title, headers, and rows", () => {
    const result = createCsvSection(
      "Users",
      ["Name", "Email"],
      [
        ["Alice", "alice@example.com"],
        ["Bob", "bob@example.com"],
      ],
    );

    expect(result).toEqual([
      "### Users",
      "Name,Email",
      "Alice,alice@example.com",
      "Bob,bob@example.com",
      "",
    ]);
  });

  test("returns empty array when rows are empty", () => {
    const result = createCsvSection("Users", ["Name", "Email"], []);
    expect(result).toEqual([]);
  });

  test("handles single row", () => {
    const result = createCsvSection(
      "Profile",
      ["Field", "Value"],
      [["name", "Alice"]],
    );

    expect(result).toEqual(["### Profile", "Field,Value", "name,Alice", ""]);
  });

  test("handles rows with special characters", () => {
    const result = createCsvSection(
      "Data",
      ["Name", "Bio"],
      [["Alice", 'Has a "great" bio, really']],
    );

    expect(result).toHaveLength(4);
    expect(result[0]).toBe("### Data");
    expect(result[1]).toBe("Name,Bio");
    // The bio should be properly escaped
    expect(result[2]).toContain("Alice");
    expect(result[3]).toBe("");
  });

  test("handles rows with null and undefined values", () => {
    const result = createCsvSection(
      "Sparse",
      ["A", "B", "C"],
      [[null, "value", undefined]],
    );

    expect(result).toEqual(["### Sparse", "A,B,C", ",value,", ""]);
  });

  test("handles rows with CSV injection values", () => {
    const result = createCsvSection("Safe", ["Formula"], [["=SUM(A1:A10)"]]);

    expect(result[2]).toBe("'=SUM(A1:A10)");
  });
});
