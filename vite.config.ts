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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "es2020",
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // ─── Manual chunks ─────────────────────────────────────────────────
        // Key rule: ALL Firebase packages go into ONE chunk to prevent
        // circular chunk references that cause TDZ runtime crashes.
        // (@firebase/* packages have deep internal cross-references that
        // Rollup cannot safely split across separate async chunk boundaries.)
        manualChunks(id) {
          // ── React runtime (tiny, always first-loaded) ──────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }

          // ── React Router ───────────────────────────────────────────────
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          ) {
            return "router-vendor";
          }

          // ── ALL Firebase in one chunk — prevents circular TDZ bug ──────
          // firebase/app, firebase/firestore, firebase/auth, firebase/storage,
          // firebase/analytics, @firebase/*, @firebase/firestore, etc.
          if (
            id.includes("node_modules/firebase/") ||
            id.includes("node_modules/@firebase/")
          ) {
            return "firebase-vendor";
          }

          // ── Radix UI + shadcn primitives ───────────────────────────────
          if (id.includes("node_modules/@radix-ui")) {
            return "radix-vendor";
          }

          // ── Lucide icons ───────────────────────────────────────────────
          if (id.includes("node_modules/lucide-react")) {
            return "icons-vendor";
          }

          // ── TanStack Query ─────────────────────────────────────────────
          if (id.includes("node_modules/@tanstack")) {
            return "query-vendor";
          }

          // ── Forms & validation ─────────────────────────────────────────
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform") ||
            id.includes("node_modules/zod")
          ) {
            return "forms-vendor";
          }

          // ── Utility / styling ──────────────────────────────────────────
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/tailwind-merge")
          ) {
            return "utils-vendor";
          }

          // ── Theming ────────────────────────────────────────────────────
          if (id.includes("node_modules/next-themes")) {
            return "theming-vendor";
          }

          // ── Notifications ──────────────────────────────────────────────
          if (id.includes("node_modules/sonner")) {
            return "notifications-vendor";
          }

          // ── Everything else from node_modules ─────────────────────────
          if (id.includes("node_modules/")) {
            return "misc-vendor";
          }

          // App code splits naturally per route via React.lazy()
        },

        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? "";
          const ext = name.split(".").pop() ?? "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
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
        pure_funcs: [
          "console.log",
          "console.warn",
          "console.info",
          "console.debug",
        ],
        passes: 2,
        dead_code: true,
        unused: true,
        // Prevent Terser from reordering declarations in ways that
        // interact badly with Rollup chunk ordering
        sequences: false,
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      // Ensure CommonJS modules inside Firebase are handled correctly
      include: [/node_modules/],
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  // Ensure Vite pre-bundles firebase properly in dev
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
      "@tanstack/react-query",
    ],
    exclude: ["@firebase/app-check"],
  },
  base: "/",
  esbuild: {
    legalComments: "none",
    target: "es2020",
  },
  css: {
    devSourcemap: mode !== "production",
  },
}));
