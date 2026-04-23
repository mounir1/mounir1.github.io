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
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      'react',
      'react-dom'
    ],
    mainFields: ['module', 'browser', 'exports', 'main'],
    conditions: ['module', 'import', 'browser', 'default']
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production to reduce size
    minify: 'terser',
    target: 'esnext', // Modern target for smaller bundles
    reportCompressedSize: false,
    chunkSizeWarningLimit: 300, // Lower warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
          'animation-vendor': ['framer-motion'],
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'theme-vendor': ['next-themes', 'sonner'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 2, // Multiple passes for better minification
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Remove comments
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable assets as inline base64 for small files
    assetsInlineLimit: 4096, // 4kb
  },
  base: mode === 'production' ? '/' : '/',
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
      'next-themes',
      'sonner',
      'use-callback-ref'
    ],
    exclude: ['@firebase/app-check'],
    // Force pre-bundling for faster dev startup
    force: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    // Enable tree shaking
    treeShaking: true,
    // Optimize for size
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  // Enable CSS modules for better scoping
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
}));
