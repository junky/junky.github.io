export default [
  {
    files: ["**/*.js"],
    ignores: ["**/*.min.js", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        XMLHttpRequest: "readonly",
        DOMParser: "readonly",
        WebSocket: "readonly",
        $: "readonly",
        alert: "readonly",
        WebSocketClient: "writable"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "semi": ["warn", "always"],
      "no-extra-semi": "warn"
    }
  }
];
