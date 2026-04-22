import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    cors: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ["console.log", "console.debug", "console.info"],
      },
      mangle: { safari10: true },
    },
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("firebase")) return "firebase";
          if (id.includes("react-dom") || id.includes("node_modules/react")) return "vendor";
          if (id.includes("@radix-ui")) return "ui";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("/pages/Admin") || id.includes("/components/admin/")) return "admin";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
