// @ts-check
import eslint from "@eslint/js";
import tanstackPluginRouter from "@tanstack/eslint-plugin-router";
import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  [
    {
      files: ["marketing/**/*.{js,jsx,ts,tsx}"],
      languageOptions: { globals: globals.browser },
      ...eslintPluginAstro.configs.recommended,
    },
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
      languageOptions: { globals: globals.browser },
      ...tanstackPluginRouter.configs["flat/recommended"],
    },
  ],
  {
    ignores: [
      "eslint.config.mjs",
      "node_modules/**",
      "packages/**",
      "apps/server/dist/**",
      "apps/server/vitest.config.ts",
      "apps/web/dist/**",
      "marketing/learn-fastify/.astro/**",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: [
          "./apps/server/tsconfig.json",
          "./apps/web/tsconfig.json",
          "./marketing/learn-fastify/tsconfig.json",
        ],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/router-core",
              name: "Redirect",
            },
          ],
        },
      ],
    },
  },
);
