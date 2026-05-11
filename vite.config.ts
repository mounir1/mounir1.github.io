import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true,
    cors: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
    mainFields: ["module", "browser", "exports", "main"],
    conditions: ["module", "import", "browser", "default"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "esnext",
    reportCompressedSize: false,
    // Firebase SDK alone is ~464KB minified (~180KB gzipped) — this is
    // unavoidable and acceptable for a portfolio backed by Firebase.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Fine-grained manual chunks — each vendor group is a separate file
        // that browsers can cache independently of app code changes.
        manualChunks(id) {
          // ── React core (tiny, always critical) ───────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-core";
          }
          // ── Router ────────────────────────────────────────────────────────
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          ) {
            return "react-router";
          }
          // ── Firebase — split into sub-packages ───────────────────────────
          if (
            id.includes("node_modules/@firebase/firestore") ||
            id.includes("node_modules/@firebase/database")
          ) {
            return "firebase-firestore";
          }
          if (
            id.includes("node_modules/@firebase/auth") ||
            id.includes("node_modules/@firebase/storage")
          ) {
            return "firebase-auth-storage";
          }
          if (
            id.includes("node_modules/firebase/") ||
            id.includes("node_modules/@firebase/")
          ) {
            return "firebase-core";
          }
          // ── Radix UI ─────────────────────────────────────────────────────
          if (id.includes("node_modules/@radix-ui")) {
            return "radix-ui";
          }
          // ── Lucide icons ─────────────────────────────────────────────────
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // ── Forms / validation ───────────────────────────────────────────
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform") ||
            id.includes("node_modules/zod")
          ) {
            return "forms";
          }
          // ── TanStack Query ────────────────────────────────────────────────
          if (id.includes("node_modules/@tanstack")) {
            return "query";
          }
          // ── Utility / styling ─────────────────────────────────────────────
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/date-fns")
          ) {
            return "utils";
          }
          // ── Theming ───────────────────────────────────────────────────────
          if (id.includes("node_modules/next-themes")) {
            return "theming";
          }
          // ── Toast / notifications ─────────────────────────────────────────
          if (
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/@radix-ui/react-toast")
          ) {
            return "notifications";
          }
          // ── Everything else from node_modules ─────────────────────────────
          if (id.includes("node_modules/")) {
            return "vendor";
          }
          // App code gets its own natural chunk per route (via lazy())
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const ext = (assetInfo.name ?? "").split(".").pop() ?? "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/css/i.test(ext)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.warn", "console.info"],
        passes: 2,
        dead_code: true,
        unused: true,
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    commonjsOptions: { transformMixedEsModules: true },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  base: "/",
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-hook-form",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
      "lucide-react",
      "sonner",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "next-themes",
    ],
    exclude: ["@firebase/app-check"],
    force: false,
  },
  esbuild: {
    legalComments: "none",
  },
  css: {
    modules: { localsConvention: "camelCaseOnly" },
    devSourcemap: mode !== "production",
  },
}));
