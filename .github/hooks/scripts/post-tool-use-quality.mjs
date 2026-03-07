/* global process */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/");
}

function collectPathsFromPatch(patchText) {
  const paths = [];
  const lines = String(patchText || "").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/);
    if (match && match[1]) {
      paths.push(normalizePath(match[1].trim()));
    }
  }
  return paths;
}

function extractFiles(input) {
  const toolInput = input.tool_input || {};
  const files = new Set();
  const directKeys = ["filePath", "file_path", "path", "targetPath"];

  for (const key of directKeys) {
    const value = toolInput[key];
    if (typeof value === "string" && value.length > 0) {
      files.add(normalizePath(value));
    }
  }

  if (Array.isArray(toolInput.files)) {
    for (const entry of toolInput.files) {
      if (typeof entry === "string") {
        files.add(normalizePath(entry));
      } else if (entry && typeof entry === "object") {
        for (const key of directKeys) {
          const value = entry[key];
          if (typeof value === "string" && value.length > 0) {
            files.add(normalizePath(value));
          }
        }
      }
    }
  }

  if (typeof toolInput.input === "string" && toolInput.input.includes("*** ")) {
    for (const path of collectPathsFromPatch(toolInput.input)) {
      files.add(path);
    }
  }

  return [...files];
}

function runCommand(args) {
  const result = spawnSync("pnpm", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    status: result.status ?? 1,
  };
}

function formatFailure(label, result) {
  const summary = (result.stderr || result.stdout || "").trim();
  const firstLine = summary.split(/\r?\n/).slice(0, 6).join("\n");
  return `${label} failed (exit ${result.status}): ${firstLine}`;
}

const raw = await readStdin();
const input = parseJson(raw);
const files = extractFiles(input)
  .map((file) => resolve(process.cwd(), file))
  .filter((file) => existsSync(file))
  .slice(0, 30);

if (files.length === 0) {
  process.exit(0);
}

const failures = [];
const tsFiles = files.filter((file) => /\.(ts|tsx|mts|cts)$/i.test(file));
const lintableFiles = files.filter((file) =>
  /\.(js|jsx|ts|tsx|mjs|cjs|mts|cts)$/i.test(file),
);

const prettierResult = runCommand(["exec", "prettier", "--write", ...files]);
if (!prettierResult.ok) {
  failures.push(formatFailure("Formatting", prettierResult));
}

if (lintableFiles.length > 0) {
  const lintResult = runCommand([
    "exec",
    "eslint",
    "--cache",
    "--cache-location",
    ".cache/eslint",
    "--cache-strategy",
    "content",
    "--fix",
    "--no-error-on-unmatched-pattern",
    ...lintableFiles,
  ]);

  if (!lintResult.ok) {
    failures.push(formatFailure("Lint", lintResult));
  }
}

if (tsFiles.length > 0) {
  const touchedPackages = new Set();
  for (const file of tsFiles) {
    const normalized = normalizePath(file);
    if (normalized.includes("/apps/web/")) {
      touchedPackages.add("@apps/web");
    }
    if (normalized.includes("/apps/server/")) {
      touchedPackages.add("@apps/server");
    }
  }

  for (const pkg of touchedPackages) {
    const typecheckResult = runCommand(["--filter", pkg, "typecheck"]);
    if (!typecheckResult.ok) {
      failures.push(formatFailure(`Typecheck (${pkg})`, typecheckResult));
    }
  }
}

if (failures.length > 0) {
  const message = `PostToolUse checks found issues:\n- ${failures.join("\n- ")}`;
  const payload = {
    systemMessage: message,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: message,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}
