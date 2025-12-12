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
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST || "localhost";

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
        manualChunks: (id) => {
          // React core - MUST be bundled together (React 19 shares internal state)
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/scheduler")
          ) {
            return "react";
          }

          // TanStack ecosystem - split more granularly
          if (id.includes("node_modules/@tanstack/react-router")) {
            return "tanstack-router";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "tanstack-query";
          }
          if (id.includes("node_modules/@tanstack/react-form")) {
            return "tanstack-form";
          }
          if (
            id.includes("node_modules/@tanstack/react-db") ||
            id.includes("node_modules/@tanstack/db") ||
            id.includes("node_modules/@tanstack/query-db") ||
            id.includes("node_modules/@tanstack/offline")
          ) {
            return "tanstack-db";
          }
          if (
            id.includes("node_modules/@tanstack/router-core") ||
            id.includes("node_modules/@tanstack/history")
          ) {
            return "tanstack-router-core";
          }
          if (id.includes("node_modules/@tanstack/query-core")) {
            return "tanstack-query-core";
          }
          if (id.includes("node_modules/@tanstack/")) {
            return "tanstack-core";
          }

          // UI libraries
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-ui";
          }
          if (id.includes("node_modules/@headlessui/")) {
            return "headlessui";
          }
          if (
            id.includes("node_modules/react-aria-components") ||
            id.includes("node_modules/@react-aria/") ||
            id.includes("node_modules/@react-stately/")
          ) {
            return "react-aria";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }

          // Markdown/syntax highlighting
          if (
            id.includes("node_modules/highlight.js") ||
            id.includes("node_modules/@shikijs/") ||
            id.includes("node_modules/shiki")
          ) {
            return "syntax-highlight";
          }
          if (
            id.includes("node_modules/rehype") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/unified") ||
            id.includes("node_modules/mdast") ||
            id.includes("node_modules/hast") ||
            id.includes("node_modules/unist") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/@mdx-js/")
          ) {
            return "markdown";
          }

          // Auth & API - split better-auth internals
          if (id.includes("node_modules/better-auth")) {
            return "auth";
          }
          if (id.includes("node_modules/@better-auth/")) {
            return "auth-core";
          }
          if (id.includes("node_modules/@trpc/")) {
            return "trpc";
          }

          // Form utilities
          if (id.includes("node_modules/react-hook-form")) {
            return "react-hook-form";
          }
          if (id.includes("node_modules/@hookform/")) {
            return "hookform-utils";
          }

          // Utilities - split out more
          if (id.includes("node_modules/date-fns")) {
            return "date-fns";
          }
          if (id.includes("node_modules/zod")) {
            return "zod";
          }
          if (id.includes("node_modules/superjson")) {
            return "superjson";
          }
          if (id.includes("node_modules/dompurify")) {
            return "dompurify";
          }
          if (id.includes("node_modules/sonner")) {
            return "sonner";
          }
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/class-variance-authority")
          ) {
            return "styling-utils";
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
