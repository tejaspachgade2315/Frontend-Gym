import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";
import globals from "globals";
import tseslint from "typescript-eslint";
import securityPlugin from "eslint-plugin-security";
import prettier from "eslint-plugin-prettier";
import unicorn from "eslint-plugin-unicorn";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: [".github/", ".husky/", "node_modules/", ".next/", "src/components/ui", "*.config.ts", "*.mjs"] },
  {
    languageOptions: {
      globals: globals.browser,
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      import: pluginImport,
      tailwindcss: tailwind,
      security: securityPlugin,
      prettier: prettier,
      unicorn: unicorn,
      react: pluginReact,
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  securityPlugin.configs.recommended,
  ...tseslint.configs.recommended,
  ...tailwind.configs["flat/recommended"],
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prettier integration rules
      "prettier/prettier": ["off", { endOfLine: "auto" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "tailwindcss/classnames-order": "off",
      "@typescript-eslint/no-explicit-any": "off",
      
    },
  },
];
