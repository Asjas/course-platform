import viteConfig from "./vite.config";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      include: [
        "src/**/*.spec.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.tsx",
        "src/**/*.test.tsx",
      ],
      passWithNoTests: false,
      setupFiles: ["./src/test-setup.ts"],
      coverage: {
        provider: "v8",
        reportsDirectory: "./coverage/unit",
        reporter: ["text-summary", "html", "lcov", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/routeTree.gen.ts",
          "src/test-setup.ts",
          "src/**/*.test.{ts,tsx}",
          "src/**/*.spec.{ts,tsx}",
          "src/**/*.d.ts",
        ],
      },
    },
  }),
);
