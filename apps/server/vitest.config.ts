import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts", "tests/**/*.test.ts", "src/**/*.test.ts"],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage/unit",
      reporter: ["text-summary", "html", "lcov", "json-summary"],
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
