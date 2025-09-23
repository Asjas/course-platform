import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
    }),
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss(),
    // MDX plugin configuration
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
      providerImportSource: "@mdx-js/react",
    }),
  ],
  css: { transformer: "lightningcss" },
  build: { cssMinify: "lightningcss" },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  // Ensure .md and .mdx files are treated as source code
  assetsInclude: ["**/*.md", "**/*.mdx"],
  // Vitest configuration
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
  },
});
