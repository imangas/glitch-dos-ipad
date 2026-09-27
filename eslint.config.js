import js from "@eslint/js";
import globals from "globals";
import html from "eslint-plugin-html";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,

  {
    ignores: ["node_modules/**"],
  },

  // js/main.js: se carga como <script type="module">
  {
    files: ["js/main.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        Dos: "readonly",
        JSZip: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },

  // js/games-config.js: script clásico, define window.gamesData
  {
    files: ["js/games-config.js"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
    },
  },

  // sw.js: corre en contexto de Service Worker, no de navegador normal
  {
    files: ["sw.js"],
    languageOptions: {
      sourceType: "script",
      ecmaVersion: 2022,
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  // index.html: lintea el <script> inline (tailwind-config)
  {
    files: ["*.html"],
    plugins: { html },
    languageOptions: {
      sourceType: "script",
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        tailwind: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },

  prettierConfig,
];