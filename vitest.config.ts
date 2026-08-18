import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * These tests cover pure business-rule/data-layer logic — no DOM needed, so
 * `environment: 'node'` is the right (and fastest) default. Component tests
 * (Phase 4+, using @testing-library/react which is already a devDependency)
 * will need `environment: 'jsdom'` — either add jsdom as a dependency and
 * switch this config's environment, or introduce a second config for
 * component tests. Not needed yet: nothing in this phase renders anything.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
