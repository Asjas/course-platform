/* global process */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function compareSemver(a, b) {
  const left = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split(".").map((part) => Number.parseInt(part, 10) || 0);

  for (let i = 0; i < 3; i += 1) {
    if (left[i] > right[i]) {
      return 1;
    }
    if (left[i] < right[i]) {
      return -1;
    }
  }

  return 0;
}

function runPnpmVersion() {
  const result = spawnSync("pnpm", ["--version"], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0) {
    return null;
  }

  return (result.stdout || "").trim();
}

const warnings = [];
const notes = [];

const nodeVersion = process.version.replace(/^v/, "");
notes.push(`Node ${nodeVersion}`);
if (compareSemver(nodeVersion, "22.16.0") < 0) {
  warnings.push(
    `Node ${nodeVersion} is below required 22.16.0.`,
  );
}

const pnpmVersion = runPnpmVersion();
if (!pnpmVersion) {
  warnings.push("pnpm is not available in PATH.");
} else {
  notes.push(`pnpm ${pnpmVersion}`);
  if (compareSemver(pnpmVersion, "10.26.2") < 0) {
    warnings.push(
      `pnpm ${pnpmVersion} is older than expected baseline 10.26.2.`,
    );
  }
}

if (!existsSync("node_modules")) {
  warnings.push("node_modules is missing. Run pnpm install --frozen-lockfile.");
} else {
  notes.push("node_modules present");
}

if (!existsSync("pnpm-lock.yaml")) {
  warnings.push("pnpm-lock.yaml is missing.");
}

const summary = warnings.length
  ? `SessionStart environment warnings:\n- ${warnings.join("\n- ")}`
  : "SessionStart environment validation passed.";

const payload = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: `${summary}\nDetected: ${notes.join(", ")}`,
  },
};

if (warnings.length > 0) {
  payload.systemMessage = summary;
}

process.stdout.write(JSON.stringify(payload));
