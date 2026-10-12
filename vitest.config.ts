/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.ts"],
    // Vitest's 5 s default is below what several admin-tab tests actually cost:
    // `userEvent.type()` types character by character through Radix inputs
    // (pointer-events maths + a React render per keystroke), and that is only
    // comfortable when the file is the only thing running. Under a full
    // parallel run one of them crosses 5 s on an idle machine and reports a
    // timeout that no amount of rerunning explains. These are wall-clock
    // budgets for slow-but-correct tests, not slow assertions.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**", "src/hooks/**", "src/data/**"],
    },
  },
});
