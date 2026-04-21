import react from "eslint-plugin-react";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Basic React/TS rules...
    },
  },
  {
    files: ["firestore.rules"],
    plugins: {
      "firebase-rules": firebaseRulesPlugin,
    },
    rules: {
      ...firebaseRulesPlugin.configs["flat/recommended"].rules,
    },
  },
];
