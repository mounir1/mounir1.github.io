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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "lucide-react",
          ],
          "forms-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
            "firebase/analytics",
          ],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") ?? [];
          const ext = info[info.length - 1];
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
        pure_funcs: ["console.log", "console.warn"],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  base: mode === "production" ? "/" : "/",
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-hook-form",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "lucide-react",
      "sonner",
    ],
    exclude: ["@firebase/app-check"],
    force: false,
  },
  esbuild: {
    legalComments: "none",
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
}));
