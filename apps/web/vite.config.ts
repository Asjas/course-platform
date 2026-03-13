import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { resolve } from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { type PluginOption, defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

const host = process.env.TAURI_DEV_HOST || "localhost";

const cypressCoverage = process.env.CYPRESS_COVERAGE === "true";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
    }),
    react({
      babel: { plugins: ["babel-plugin-react-compiler"] },
    }),
    devtools({ removeDevtoolsOnBuild: true }),
    tailwindcss(),
    cypressCoverage &&
      (istanbul({
        include: "src/**/*.{ts,tsx}",
        exclude: [
          "node_modules",
          "cypress",
          "src/routeTree.gen.ts",
          "src/test-setup.ts",
          "src/**/*.test.{ts,tsx}",
          "src/**/*.spec.{ts,tsx}",
        ],
        cypress: true,
        requireEnv: true,
        forceBuildInstrument: true,
      }) as PluginOption),
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeHighlight,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["no-underline"],
            },
          },
        ],
      ],
      providerImportSource: "@mdx-js/react",
      include: ["**/*.mdx"],
    }),
  ],
  css: {
    devSourcemap: true,
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist(">= 0.25%")),
    },
  },
  build: {
    cssMinify: "lightningcss",
    license: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules/zod")) {
            return "zod";
          }
          if (
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/superjson") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/@epic-web/") ||
            id.includes("node_modules/ulid")
          ) {
            return "utils";
          }
          if (id.includes("node_modules/highlight.js")) {
            return "highlight";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (
            id.includes("node_modules/rehype") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/unified") ||
            id.includes("node_modules/mdast") ||
            id.includes("node_modules/hast") ||
            id.includes("node_modules/unist") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/@mdx-js/") ||
            id.includes("node_modules/@shikijs/") ||
            id.includes("node_modules/dompurify")
          ) {
            return "markdown";
          }
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform/") ||
            id.includes("node_modules/@tanstack/react-form") ||
            id.includes("node_modules/@tanstack/form-core")
          ) {
            return "forms";
          }
          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/@headlessui/")
          ) {
            return "ui-libs";
          }
          if (
            id.includes("node_modules/react-aria-components") ||
            id.includes("node_modules/@react-aria/") ||
            id.includes("node_modules/@react-stately/")
          ) {
            return "react-aria";
          }
          if (id.includes("node_modules/@trpc/")) {
            return "trpc";
          }
          if (
            id.includes("node_modules/better-auth") ||
            id.includes("node_modules/@better-auth/")
          ) {
            return "auth";
          }
          if (
            id.includes("node_modules/@tanstack/react-router") ||
            id.includes("node_modules/@tanstack/router-core") ||
            id.includes("node_modules/@tanstack/history")
          ) {
            return "tanstack-router";
          }
          if (
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/@tanstack/query-core")
          ) {
            return "tanstack-query";
          }
          if (
            id.includes("node_modules/@tanstack/react-db") ||
            id.includes("node_modules/@tanstack/db") ||
            id.includes("node_modules/@tanstack/query-db") ||
            id.includes("node_modules/@tanstack/offline")
          ) {
            return "tanstack-db";
          }
          if (id.includes("node_modules/@tanstack/")) {
            return "tanstack-core";
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/react-compiler-runtime") ||
            id.includes("node_modules/use-sync-external-store") ||
            id.includes("node_modules/react-is")
          ) {
            return "react";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  server: {
    host,
    port: 4173,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  clearScreen: false,
});
