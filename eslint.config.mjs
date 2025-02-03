import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("eslint:recommended"),
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },

    files: ["**/*.{ts,mts,cts}"],
    plugins: {
      prettier: eslintPluginPrettier,
      "@typescript-eslint": tseslint,
    },
    rules: {
      // ESLint Core Rules
      "arrow-spacing": [
        "warn",
        {
          before: true,
          after: true,
        },
      ],
      "brace-style": [
        "error",
        "1tbs",
        {
          allowSingleLine: true,
        },
      ],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",
      curly: ["error", "multi-line", "consistent"],
      "dot-location": ["error", "property"],
      "handle-callback-err": "off",
      indent: ["error", 2],
      "keyword-spacing": "error",
      "max-nested-callbacks": [
        "error",
        {
          max: 4,
        },
      ],
      "max-statements-per-line": [
        "error",
        {
          max: 2,
        },
      ],
      "no-console": "off",
      "no-empty-function": "error",
      "no-floating-decimal": "error",
      "no-inline-comments": "error",
      "no-lonely-if": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": [
        "error",
        {
          max: 2,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
      "no-shadow": [
        "error",
        {
          allow: ["err", "resolve", "reject"],
        },
      ],
      "no-trailing-spaces": ["error"],
      "no-var": "error",
      "object-curly-spacing": ["error", "always"],
      "prefer-const": "error",
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": "error",
      yoda: "error",

      // TypeScript-Specific Rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // Optional: Strict and Stylistic Rules
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      ...tseslint.configs.stylistic.rules,

      // Add these Prettier-compatible rules
      "prettier/prettier": "error",
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
