import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // CommonJS files (scripts/*.cjs, tests/browser/*.spec.cjs) run directly in
  // Node, where `require()` is the correct way to import. Every other rule
  // still applies to them.
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },

  // Internal links stay as plain <a> elements on purpose. The site's template
  // scripts (jQuery, Swiper, GSAP fade-ins, magic cursor: see
  // components/layout/ThemeScripts.tsx) initialise once per full page load.
  // Next.js <Link> navigates client-side without a page load, so the next
  // page's sliders and fade-in sections would never be initialised and could
  // stay invisible. Revisit if the template scripts are replaced by React
  // components.
  {
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party template JavaScript shipped as-is (jQuery, Swiper, three.js,
    // GSAP plugins and the template's own main.js). Not our application code.
    "public/assets/js/**",
  ]),
]);

export default eslintConfig;
