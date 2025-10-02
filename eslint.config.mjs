import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import esxPlugin from "eslint-plugin-es-x";
import html from "eslint-plugin-html";
import pluginPromise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import security from "eslint-plugin-security";
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
  ...eslintPluginYml.configs["flat/recommended"],
  [
    {
      files: ["**/*.html"],
      languageOptions: {
        globals: globals.browser,
      },
      plugins: { html },
    },
    {
      files: ["marketing/**/*.{js,jsx,ts,tsx}"],
      plugins: { react },
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
      extends: fixupConfigRules(
        compat.extends(
          "plugin:import/recommended",
          "plugin:import/typescript",
          "plugin:astro/recommended",
          "plugin:react-hooks/recommended",
          "plugin:jsx-a11y/recommended",
        ),
      ),
    },
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
      plugins: { react },
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
      extends: fixupConfigRules(
        compat.extends(
          "plugin:import/recommended",
          "plugin:import/typescript",
          "plugin:react-hooks/recommended",
          "plugin:jsx-a11y/recommended",
          "plugin:@tanstack/eslint-plugin-router/recommended",
        ),
      ),
      rules: {
        "react/no-children-prop": "off",
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
      extends: fixupConfigRules(
        compat.extends(
          "plugin:import/recommended",
          "plugin:import/typescript",
          "plugin:n/recommended",
        ),
      ),
      rules: {
        "n/no-unpublished-import": "off",
        "n/exports-style": ["error", "module.exports"],
      },
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
);
