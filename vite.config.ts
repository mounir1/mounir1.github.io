import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  server: {
    host: '::',
    port: 8080,
    open: false,
    cors: true,
  },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion'))
            return 'motion';
          if (
            id.includes('node_modules/@radix-ui') ||
            id.includes('node_modules/cmdk') ||
            id.includes('node_modules/sonner') ||
            id.includes('node_modules/vaul') ||
            id.includes('node_modules/embla')
          )
            return 'ui';
          if (
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/@tanstack')
          )
            return 'router';
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom')
          )
            return 'vendor';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3'))
            return 'charts';
          if (
            id.includes('node_modules/zod') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform')
          )
            return 'forms';
          if (id.includes('node_modules/lucide-react')) return 'icons';
        },
      },
    },
  },
});
