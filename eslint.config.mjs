import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginSecurity from "eslint-plugin-security";
import pluginNoSecrets from "eslint-plugin-no-secrets";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Security rules: catch unsafe patterns (regex DoS, eval, fs path injection)
  {
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-object-injection": "off", // Too noisy for TS codebases
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-unsafe-regex": "error",
    },
  },

  // Secret detection: catch accidentally committed API keys/tokens
  {
    plugins: {
      "no-secrets": pluginNoSecrets,
    },
    rules: {
      "no-secrets/no-secrets": ["error", { tolerance: 4.2 }],
    },
  },
]);

export default eslintConfig;
