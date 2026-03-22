import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts", "tests/**/*.test.ts", "src/**/*.test.ts"],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage/unit",
      reporter: ["text-summary", "html", "lcov", "json-summary", "json"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/*.d.ts",
        "src/drizzle.config.ts",
      ],
    },
  },
});
