import {
  insertBulletList,
  insertHeader,
  insertLink,
  insertNumberedList,
  insertQuote,
  toggleBold,
  toggleCode,
  toggleItalic,
} from "../handlers";
import { fromAny } from "@total-typescript/shoehorn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Create a minimal HTMLTextAreaElement stub for testing formatting handlers. */
function makeTextarea(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): HTMLTextAreaElement {
  return fromAny({
    value,
    selectionStart,
    selectionEnd,
    focus: vi.fn(),
    setSelectionRange: vi.fn(),
  });
}

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// insertHeader
// ---------------------------------------------------------------------------
describe("insertHeader", () => {
  it("inserts ### at the cursor position", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertHeader({ textarea, value: "", onChange });

    expect(result).toBe("### ");
    expect(textarea.focus).toHaveBeenCalled();
    expect(textarea.setSelectionRange).toHaveBeenCalledWith(4, 4);
  });

  it("inserts at mid-string cursor position", () => {
    const textarea = makeTextarea("world", 0, 0);
    let result = "world";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertHeader({ textarea, value: result, onChange });

    expect(result).toBe("### world");
  });
});

// ---------------------------------------------------------------------------
// toggleBold
// ---------------------------------------------------------------------------
describe("toggleBold", () => {
  it("wraps selected text in **", () => {
    const textarea = makeTextarea("hello world", 6, 11);
    let result = "hello world";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleBold({ textarea, value: result, onChange });

    expect(result).toBe("hello **world**");
  });

  it("removes ** when cursor is inside bold text", () => {
    const textarea = makeTextarea("**bold**", 2, 6);
    let result = "**bold**";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleBold({ textarea, value: result, onChange });

    expect(result).toBe("bold");
  });

  it("wraps empty selection in ****", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleBold({ textarea, value: result, onChange });

    expect(result).toBe("****");
  });
});

// ---------------------------------------------------------------------------
// toggleItalic
// ---------------------------------------------------------------------------
describe("toggleItalic", () => {
  it("wraps selected text in _", () => {
    const textarea = makeTextarea("hello world", 6, 11);
    let result = "hello world";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleItalic({ textarea, value: result, onChange });

    expect(result).toBe("hello _world_");
  });

  it("removes _ when cursor is inside italic text", () => {
    const textarea = makeTextarea("_italic_", 1, 7);
    let result = "_italic_";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleItalic({ textarea, value: result, onChange });

    expect(result).toBe("italic");
  });
});

// ---------------------------------------------------------------------------
// insertQuote
// ---------------------------------------------------------------------------
describe("insertQuote", () => {
  it("inserts > when there is no selection at start of line", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertQuote({ textarea, value: result, onChange });

    expect(result).toBe("> ");
  });

  it("wraps selected text in blockquote lines", () => {
    const textarea = makeTextarea("line one\nline two", 0, 17);
    let result = "line one\nline two";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertQuote({ textarea, value: result, onChange });

    expect(result).toContain("> line one");
    expect(result).toContain("> line two");
  });

  it("adds newline prefix when not at start of line", () => {
    const textarea = makeTextarea("some text", 9, 9);
    let result = "some text";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertQuote({ textarea, value: result, onChange });

    expect(result).toContain("\n> ");
  });
});

// ---------------------------------------------------------------------------
// toggleCode
// ---------------------------------------------------------------------------
describe("toggleCode", () => {
  it("wraps selected text in backticks", () => {
    const textarea = makeTextarea("hello world", 6, 11);
    let result = "hello world";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleCode({ textarea, value: result, onChange });

    expect(result).toBe("hello `world`");
  });

  it("removes backticks when cursor is inside inline code", () => {
    const textarea = makeTextarea("`code`", 1, 5);
    let result = "`code`";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleCode({ textarea, value: result, onChange });

    expect(result).toBe("code");
  });

  it("inserts `` for empty selection", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    toggleCode({ textarea, value: result, onChange });

    expect(result).toBe("``");
  });
});

// ---------------------------------------------------------------------------
// insertLink
// ---------------------------------------------------------------------------
describe("insertLink", () => {
  it("wraps selected text in [text](url)", () => {
    const textarea = makeTextarea("hello world", 6, 11);
    let result = "hello world";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertLink({ textarea, value: result, onChange });

    expect(result).toBe("hello [world](url)");
  });

  it("inserts [](url) for empty selection", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertLink({ textarea, value: result, onChange });

    expect(result).toBe("[](url)");
  });
});

// ---------------------------------------------------------------------------
// insertBulletList
// ---------------------------------------------------------------------------
describe("insertBulletList", () => {
  it("inserts - at the cursor when at start of line", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertBulletList({ textarea, value: result, onChange });

    expect(result).toBe("- ");
  });

  it("prefixes each selected line with -", () => {
    const textarea = makeTextarea("alpha\nbeta", 0, 10);
    let result = "alpha\nbeta";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertBulletList({ textarea, value: result, onChange });

    expect(result).toContain("- alpha");
    expect(result).toContain("- beta");
  });

  it("adds newline prefix when not at start of line", () => {
    const textarea = makeTextarea("text here", 9, 9);
    let result = "text here";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertBulletList({ textarea, value: result, onChange });

    expect(result).toContain("\n- ");
  });
});

// ---------------------------------------------------------------------------
// insertNumberedList
// ---------------------------------------------------------------------------
describe("insertNumberedList", () => {
  it("inserts 1. at cursor when at start of line", () => {
    const textarea = makeTextarea("", 0, 0);
    let result = "";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertNumberedList({ textarea, value: result, onChange });

    expect(result).toBe("1. ");
  });

  it("numbers each selected line", () => {
    const textarea = makeTextarea("alpha\nbeta", 0, 10);
    let result = "alpha\nbeta";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertNumberedList({ textarea, value: result, onChange });

    expect(result).toContain("1. alpha");
    expect(result).toContain("2. beta");
  });

  it("adds newline prefix when cursor is not at start of line", () => {
    const textarea = makeTextarea("text", 4, 4);
    let result = "text";
    const onChange = vi.fn((updater: string | ((p: string) => string)) => {
      result = typeof updater === "function" ? updater(result) : updater;
    });

    insertNumberedList({ textarea, value: result, onChange });

    expect(result).toContain("\n1. ");
  });
});
