/**
 * Detects which Cypress E2E spec files need to run based on changed files in a PR.
 *
 * Usage:
 *   pnpm tsx scripts/get-changed-e2e-specs.ts
 *
 * Environment:
 *   GITHUB_BASE_REF - The base branch of the PR (defaults to "main")
 *   GITHUB_OUTPUT   - Path to GitHub Actions output file (written when running in CI)
 *
 * Output (appended to GITHUB_OUTPUT, or written to stdout when running locally):
 *   specs=<comma-separated spec glob patterns>  run specific specs
 *   specs=                                       run all specs (empty = run all)
 *   specs=skip                                   no e2e-relevant changes detected, skip run
 */
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const baseRef = process.env.GITHUB_BASE_REF ?? "main";

// ---------------------------------------------------------------------------
// Mapping: source file path substrings → spec file names
// Each entry lists one or more path substrings; when any changed file contains
// one of those substrings, the associated spec(s) are added to the run list.
// ---------------------------------------------------------------------------
const SPEC_MAPPINGS: { patterns: string[]; specs: string[] }[] = [
  // Auth routes
  {
    patterns: [
      "routes/(auth)/signin",
      "routes/(auth)/signup",
      "routes/(auth)/verify-email",
    ],
    specs: ["auth-forms.cy.ts"],
  },
  {
    patterns: ["routes/(auth)/reset-password"],
    specs: ["reset-password.cy.ts"],
  },
  {
    patterns: ["routes/(auth)"],
    specs: ["navigation-and-guards.cy.ts"],
  },

  // Admin routes
  {
    patterns: [
      "routes/_authenticated/admin/announcements",
      "routers/announcements",
    ],
    specs: ["admin-announcements.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/audit", "routers/audit"],
    specs: ["admin-audit.cy.ts"],
  },
  {
    patterns: [
      "routes/_authenticated/admin/chat-reports",
      "routers/chatReports",
    ],
    specs: ["admin-chat-reports.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/coupons", "routers/coupons"],
    specs: ["admin-coupons.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/courses", "routers/courses"],
    specs: [
      "admin-courses.cy.ts",
      "admin-course-creation-flow.cy.ts",
      "admin-course-editor.cy.ts",
    ],
  },
  {
    patterns: [
      "routes/_authenticated/admin/early-signups",
      "routers/earlySignups",
    ],
    specs: ["admin-early-signups.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/reviews", "routers/reviews"],
    specs: ["admin-reviews.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/stats"],
    specs: ["admin-stats.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/admin/users", "routers/users"],
    specs: ["admin-users.cy.ts"],
  },
  // Admin layout / navigation (matches the admin route.tsx and all admin paths)
  {
    patterns: ["routes/_authenticated/admin"],
    specs: ["admin-navigation.cy.ts"],
  },

  // Authenticated routes
  {
    patterns: ["routes/_authenticated/account"],
    specs: ["account.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/dashboard"],
    specs: ["dashboard.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/notifications", "routers/notifications"],
    specs: ["notifications.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/profile"],
    specs: ["profile.cy.ts"],
  },
  {
    patterns: ["routes/_authenticated/sync-status"],
    specs: ["sync-status.cy.ts"],
  },

  // Public / marketing routes
  {
    patterns: ["routes/blog"],
    specs: ["blog.cy.ts"],
  },
  {
    patterns: ["routes/cookies"],
    specs: ["cookie-policy.cy.ts"],
  },
  {
    patterns: ["routes/downloads"],
    specs: ["downloads.cy.ts"],
  },
  {
    patterns: ["routes/support", "routers/supportTickets"],
    specs: ["support-tickets.cy.ts"],
  },
  // Home page, terms and privacy pages
  {
    patterns: ["routes/index.tsx", "routes/terms.tsx", "routes/privacy.tsx"],
    specs: ["spec.cy.ts"],
  },

  // Root layout — affects header/footer, default layout, and navigation guards
  {
    patterns: ["routes/__root.tsx"],
    specs: [
      "header-and-footer.cy.ts",
      "default-layout.cy.ts",
      "navigation-and-guards.cy.ts",
    ],
  },
  // Authenticated layout guard
  {
    patterns: ["routes/_authenticated/route.tsx"],
    specs: ["navigation-and-guards.cy.ts"],
  },

  // Specific components with clear spec coverage
  {
    patterns: ["components/theme-toggle"],
    specs: ["theme-toggle.cy.ts"],
  },
  {
    patterns: ["components/sync-status-indicator"],
    specs: ["sync-status.cy.ts"],
  },
  {
    patterns: ["components/header", "components/footer"],
    specs: ["header-and-footer.cy.ts"],
  },
];

// ---------------------------------------------------------------------------
// Shared / foundational code patterns — any change here triggers all specs.
// These are modules that affect many features simultaneously and cannot be
// reliably mapped to a single spec.
// ---------------------------------------------------------------------------
const SHARED_CODE_PATTERNS = [
  "apps/web/src/lib/",
  "apps/web/src/styles/",
  "apps/web/tailwind.css",
  "apps/web/vite.config.ts",
  "apps/web/src/components/", // generic shared UI components
  "apps/server/src/lib/",
  "apps/server/src/plugins/",
  "apps/server/src/hooks/",
  "apps/server/src/db/",
  "apps/server/src/config.ts",
  "apps/server/src/server.ts",
  "apps/server/src/router.ts",
  "apps/server/src/index.ts",
  "packages/", // shared-ui package changes affect many components
];

// Scripts that are invoked by CI and directly affect the E2E environment.
// Changes to these files should be treated as E2E-relevant and must not be
// filtered out by isNonE2EFile.
const E2E_CRITICAL_SCRIPTS = [
  "scripts/ci-migrate.ts",
  "scripts/seed-test-data.ts",
];

// ---------------------------------------------------------------------------
// Files that have no impact on E2E behaviour and should not trigger any run.
// ---------------------------------------------------------------------------
function isNonE2EFile(file: string): boolean {
  // Unit test / spec files outside of Cypress
  if (
    (file.includes(".test.ts") ||
      file.includes(".test.tsx") ||
      file.includes(".spec.ts")) &&
    !file.includes("cypress/e2e/")
  ) {
    return true;
  }
  // GitHub Actions workflows and config
  if (file.startsWith(".github/")) {
    return true;
  }
  // Documentation
  if (file.endsWith(".md") || file.startsWith("docs/")) {
    return true;
  }
  // CI helper scripts (not application code). Some scripts are E2E-critical
  // and must not be ignored; those are listed in E2E_CRITICAL_SCRIPTS.
  if (file.startsWith("scripts/")) {
    return !E2E_CRITICAL_SCRIPTS.includes(file);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getChangedFiles(): string[] | null {
  try {
    const output = execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    console.error("⚠️  Error getting changed files:", error);
    // Signal to the caller that the diff failed so it can run all specs safely.
    return null;
  }
}

function extractSpecName(file: string): string | null {
  const match = file.match(/apps\/web\/cypress\/e2e\/(.+\.cy\.ts)$/);
  return match ? match[1] : null;
}

function isSharedCode(file: string): boolean {
  return SHARED_CODE_PATTERNS.some((pattern) => file.includes(pattern));
}

function getMappedSpecs(file: string): string[] {
  const specs: string[] = [];
  for (const mapping of SPEC_MAPPINGS) {
    if (mapping.patterns.some((pattern) => file.includes(pattern))) {
      specs.push(...mapping.specs);
    }
  }
  return specs;
}

function writeOutput(key: string, value: string): void {
  const line = `${key}=${value}\n`;
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, line);
  } else {
    process.stdout.write(line);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const changedFiles = getChangedFiles();

  if (changedFiles === null) {
    console.log(
      "⚠️  Could not determine changed files — running all E2E specs as a safety measure",
    );
    writeOutput("specs", "");
    return;
  }

  console.log(`📋 Changed files (${changedFiles.length}):`);
  for (const f of changedFiles) {
    console.log(`  - ${f}`);
  }

  const specFiles = new Set<string>();
  let runAll = false;
  let hasE2ERelevantChanges = false;

  for (const file of changedFiles) {
    // Skip files that have no e2e impact
    if (isNonE2EFile(file)) {
      continue;
    }

    // Direct Cypress spec file change — include it verbatim
    const spec = extractSpecName(file);
    if (spec) {
      console.log(`✅ Spec file changed: ${spec}`);
      specFiles.add(spec);
      hasE2ERelevantChanges = true;
      continue;
    }

    // Shared / foundational code — must run everything
    if (isSharedCode(file)) {
      console.log(`🌐 Shared code changed: ${file} → running all specs`);
      runAll = true;
      hasE2ERelevantChanges = true;
      continue;
    }

    // Known source-to-spec mapping
    const mapped = getMappedSpecs(file);
    if (mapped.length > 0) {
      console.log(`🎯 Mapped ${file} → ${mapped.join(", ")}`);
      for (const s of mapped) {
        specFiles.add(s);
      }
      hasE2ERelevantChanges = true;
      continue;
    }

    // Unmapped source code change — run all specs to be safe
    if (
      file.startsWith("apps/web/src/") ||
      file.startsWith("apps/server/src/") ||
      file.startsWith("packages/") ||
      file.startsWith("apps/web/cypress/") ||
      file === "apps/web/cypress.config.ts"
    ) {
      console.log(`❓ Unmapped source change: ${file} → running all specs`);
      runAll = true;
      hasE2ERelevantChanges = true;
    }
  }

  if (!hasE2ERelevantChanges) {
    console.log("⏭️  No E2E-relevant changes detected — skipping E2E tests");
    writeOutput("specs", "skip");
    return;
  }

  if (runAll || specFiles.size === 0) {
    // runAll is set when shared/foundational code changed.
    // specFiles.size === 0 with hasE2ERelevantChanges === true means a source
    // file that belongs to a source directory was changed but didn't match any
    // known mapping — conservative fallback is to run the full suite.
    console.log("🔄 Running all E2E specs");
    writeOutput("specs", "");
    return;
  }

  const specList = [...specFiles].map((s) => `cypress/e2e/${s}`).join(",");

  console.log(`✅ Running ${specFiles.size} spec(s): ${specList}`);
  writeOutput("specs", specList);
}

main();
