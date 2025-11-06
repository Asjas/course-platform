import { useEffect, useState } from "react";
import { type Highlighter, createHighlighter } from "shiki";
import { cn } from "~/lib/utils";

interface Props {
  code: string;
  lang: string;
  theme: "catppuccin-mocha";
  lineNumbers?: boolean;
}

export function ShikiCodeBlock({
  code,
  lang,
  theme,
  lineNumbers = false,
}: Props) {
  const [html, setHtml] = useState<string>("");
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    createHighlighter({
      themes: ["catppuccin-mocha"],
      langs: [
        "bash",
        "css",
        "html",
        "javascript",
        "js",
        "json",
        "jsx",
        "markdown",
        "md",
        "python",
        "py",
        "tsx",
        "typescript",
        "ts",
        "yaml",
        "yml",
      ],
    })
      .then((hl) => {
        if (mounted) setHighlighter(hl);

        return undefined;
      })
      .catch((err) => {
        console.error("Failed to load Shiki highlighter:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!highlighter || !code) return;

    const rendered = highlighter.codeToHtml(code.trim(), {
      lang: lang || "plaintext",
      theme,
      transformers: lineNumbers
        ? [
            {
              line(node, lineNumber) {
                // Add data-line so we can target it in CSS
                node.properties["data-line"] = String(lineNumber);
                // Optional: add class
                this.addClassToHast(node, "shiki-line");
              },
              pre(node) {
                // Optional: add class to <pre>
                this.addClassToHast(node, "shiki-pre");
              },
            },
          ]
        : undefined,
    });

    setHtml(rendered);
  }, [highlighter, code, lang, theme, lineNumbers]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!html) return <pre className="p-4">Loading…</pre>;

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg bg-[#0d1117] text-sm">
      {/* Language label */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded bg-[#21262d] px-2 py-0.5 text-xs font-medium text-gray-300">
        {lang || "plaintext"}
      </div>

      {/* Copy button (appears on hover) */}
      <button
        className={cn(
          "absolute top-10 right-2 z-10 rounded bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-600",
          copied && "bg-green-600 text-white",
        )}
        onClick={copy}
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <div
        className={cn("overflow-x-auto p-4 pt-10", lineNumbers && "pl-12")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
