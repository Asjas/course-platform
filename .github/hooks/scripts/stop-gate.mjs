/* global process */

import { spawnSync } from "node:child_process";

function runStep(label, args) {
  const result = spawnSync("pnpm", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
  });

  return {
    label,
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function summarize(result) {
  const combined = (result.stderr || result.stdout || "").trim();
  return combined.split(/\r?\n/).slice(0, 10).join("\n");
}

const steps = [
  runStep("pnpm format", ["format"]),
  runStep("pnpm lint", ["lint"]),
  runStep("pnpm typecheck", ["typecheck"]),
  runStep("pnpm build", ["build"]),
];

const failed = steps.find((step) => !step.ok);
if (!failed) {
  process.exit(0);
}

const reason = `${failed.label} failed (exit ${failed.status}). Fix validation errors before finishing.`;
const details = summarize(failed);

const payload = {
  decision: "block",
  reason,
  hookSpecificOutput: {
    hookEventName: "Stop",
    additionalContext: details
      ? `${reason}\n\n${details}`
      : reason,
  },
};

process.stdout.write(JSON.stringify(payload));
