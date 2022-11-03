module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  ignorePatterns: [
    "**/wrap/**/*.*",
    "**/build/**/*.*",
    "**/bin/**/*.*",
    "**/__tests__/**/*.*",
    "**/node_modules/**/*.*",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
  },
  plugins: [
    "eslint-plugin-import",
    "@typescript-eslint",
    "prettier",
    "eslint-plugin-react",
    "@next/eslint-plugin-next",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:json/recommended",
    "plugin:react/recommended",
    "plugin:@next/next/recommended",
    "next/core-web-vitals",
  ],
  rules: {
    "prettier/prettier": ["error"],
    "spaced-comment": ["error", "always", { markers: ["/"] }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/member-ordering": [
      "error",
      {
        classes: {
          order: "as-written",
          memberTypes: [
            // Constructors
            "public-constructor",
            "protected-constructor",
            "private-constructor",

            // Methods
            "public-static-method",
            "public-abstract-method",
            "public-instance-method",
            "public-decorated-method",
            "protected-static-method",
            "protected-abstract-method",
            "protected-instance-method",
            "protected-decorated-method",
            "private-static-method",
            "private-abstract-method",
            "private-instance-method",
            "private-decorated-method",
          ],
        },
      },
    ],
    "@typescript-eslint/no-var-requires": "warn",
    "import/order": [
      "error",
      {
        groups: [
          ["index", "sibling", "parent", "internal"],
          ["external", "builtin"],
          "object",
        ],
        "newlines-between": "always",
      },
    ],
  },
};
