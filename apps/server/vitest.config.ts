import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.spec.ts",
      "tests/**/*.test.ts",
      "src/lib/**/*.test.ts",
    ],
    passWithNoTests: false,
  },
});
