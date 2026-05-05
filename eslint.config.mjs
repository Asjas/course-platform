import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tanstackQueryPlugin from "@tanstack/eslint-plugin-query";
import pluginCypress from "eslint-plugin-cypress";
import esxPlugin from "eslint-plugin-es-x";
import html from "eslint-plugin-html";
import importZod from "eslint-plugin-import-zod";
import jsonPlugin from "eslint-plugin-json";
import n from "eslint-plugin-n";
import pluginPromise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import unusedImports from "eslint-plugin-unused-imports";
import eslintPluginYml from "eslint-plugin-yml";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  pluginPromise.configs["flat/recommended"],
  esxPlugin.configs["flat/restrict-to-es2022"],
  jsonPlugin.configs["recommended"],
  importZod.configs.recommended,
  ...eslintPluginYml.configs["flat/recommended"],
  [
    {
      plugins: { "unused-imports": unusedImports },
      rules: {
        "yml/no-empty-mapping-value": "off",
      },
    },
    {
      files: ["**/*.html"],
      languageOptions: {
        globals: globals.browser,
      },
      plugins: { html },
    },
    {
      files: ["marketing/**/*.{js,jsx,ts,tsx}"],
      plugins: { react, "react-hooks": reactHooks, "cypress": pluginCypress },
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 2022,
          sourceType: "module",
          project: "./marketing/learn-fastify/tsconfig.json",
        },
      },
      settings: {
        "react": { version: "detect" },
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./marketing/learn-fastify/tsconfig.json",
            tsconfigRootDir: __dirname,
          },
        },
      },
      extends: [
        pluginCypress.configs.recommended,
        pluginCypress.configs.globals,
        reactCompiler.configs.recommended,
        reactRefresh.configs.recommended,
        reactRefresh.configs.vite,
        ...tanstackQueryPlugin.configs["flat/recommended"],
        reactHooks.configs.flat["recommended-latest"],
        fixupConfigRules(
          compat.extends(
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:astro/recommended",
            "plugin:jsx-a11y/recommended",
          ),
        ),
      ],
    },
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
      plugins: { react, "react-hooks": reactHooks, "cypress": pluginCypress },
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 2022,
          sourceType: "module",
          project: "./apps/web/tsconfig.json",
        },
      },
      settings: {
        "react": { version: "detect" },
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./apps/web/tsconfig.json",
            tsconfigRootDir: __dirname,
          },
        },
      },
      extends: [
        pluginCypress.configs.recommended,
        pluginCypress.configs.globals,
        reactCompiler.configs.recommended,
        reactRefresh.configs.recommended,
        reactRefresh.configs.vite,
        reactHooks.configs.flat["recommended-latest"],
        fixupConfigRules(
          compat.extends(
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:jsx-a11y/recommended",
            "plugin:@tanstack/eslint-plugin-router/recommended",
          ),
        ),
      ],
      rules: {
        "react/no-children-prop": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "react-hooks/set-state-in-effect": "off",
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
        "react-refresh/only-export-components": [
          0,
          {
            allowConstantExport: true,
            allowExportNames: ["Route", "loader"],
          },
        ],
      },
    },
    {
      files: ["apps/server/**/*.{js,ts}"],
      plugins: { security },
      languageOptions: {
        globals: globals.node,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "module",
          project: "./apps/server/tsconfig.json",
          tsconfigRootDir: __dirname,
        },
      },
      settings: {
        "node": {
          version: "autodetect",
        },
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./apps/server/tsconfig.json",
            tsconfigRootDir: __dirname,
          },
        },
      },
      extends: [
        n.configs["flat/recommended"],
        ...fixupConfigRules(
          compat.extends(
            "plugin:import/recommended",
            "plugin:import/typescript",
          ),
        ),
      ],
      rules: {
        "n/no-unpublished-import": "off",
        "n/exports-style": ["error", "module.exports"],
        "n/no-unsupported-features/node-builtins": [
          "error",
          { ignores: ["import.meta.dirname", "import.meta.filename"] },
        ],
      },
    },
  ],
  {
    ignores: [
      "node_modules/**",
      "packages/**",
      "apps/server/dist/**",
      "apps/server/vitest.config.ts",
      "apps/server/coverage/**",
      "apps/web/dist/**",
      "apps/web/src-tauri/**",
      "apps/web/coverage/**",
      "marketing/learn-fastify/.astro/**",
      "marketing/learn-fastify/dist/**",
    ],
  },
);
