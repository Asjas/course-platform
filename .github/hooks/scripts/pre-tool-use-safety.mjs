/* global process */

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

function extractFilesFromToolInput(toolInput) {
  const paths = new Set();

  if (!toolInput || typeof toolInput !== "object") {
    return paths;
  }

  const directKeys = ["filePath", "file_path", "path", "targetPath"];
  for (const key of directKeys) {
    const value = toolInput[key];
    if (typeof value === "string" && value.length > 0) {
      paths.add(normalizePath(value));
    }
  }

  if (Array.isArray(toolInput.files)) {
    for (const entry of toolInput.files) {
      if (typeof entry === "string") {
        paths.add(normalizePath(entry));
      } else if (entry && typeof entry === "object") {
        for (const key of directKeys) {
          const value = entry[key];
          if (typeof value === "string" && value.length > 0) {
            paths.add(normalizePath(value));
          }
        }
      }
    }
  }

  if (typeof toolInput.input === "string" && toolInput.input.includes("*** ")) {
    const lines = toolInput.input.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/);
      if (match && match[1]) {
        paths.add(normalizePath(match[1].trim()));
      }
    }
  }

  return paths;
}

function isMigrationSql(path) {
  const normalized = normalizePath(path);
  return /(^|\/)apps\/server\/drizzle\/[^/]+\.sql$/i.test(normalized);
}

function isDestructiveCommand(command) {
  const text = String(command || "").toLowerCase();

  const patterns = [
    /(^|\s)git\s+reset\s+--hard\b/,
    /(^|\s)git\s+checkout\s+--\b/,
    /(^|\s)git\s+clean\s+-fdx\b/,
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function isHardBlockedCommand(command) {
  const text = String(command || "").toLowerCase().trim();
  return /(^|\s)(sudo\s+)?rm\s+-rf\s+\/(\s|$|;|&&|\|\|)/.test(text);
}

function printDeny(reason) {
  const payload = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}

function printAsk(reason) {
  const payload = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}

const raw = await readStdin();
const input = parseJson(raw);
const toolInput = input.tool_input || {};

const command =
  toolInput.command || toolInput.cmd || toolInput.script || toolInput.text || "";
if (isHardBlockedCommand(command)) {
  printDeny(
    "Blocked by PreToolUse safety guard: hard stop on rm -rf /.",
  );
  process.exit(0);
}

if (isDestructiveCommand(command)) {
  printAsk(
    "PreToolUse safety prompt: confirm access for risky command (git reset --hard / git checkout -- / git clean -fdx).",
  );
  process.exit(0);
}

for (const filePath of extractFilesFromToolInput(toolInput)) {
  if (isMigrationSql(filePath)) {
    printAsk(
      `PreToolUse safety prompt: confirm access before editing migration SQL file (${filePath}).`,
    );
    process.exit(0);
  }
}

// Allow by default.
process.exit(0);
