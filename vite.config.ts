import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        compact: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
  build: {
    // Code splitting configuration for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and React Router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Supabase chunk
          'supabase': ['@supabase/supabase-js'],
          // Framer Motion chunk
          'framer': ['framer-motion'],
          // Icons chunk
          'icons': ['lucide-react'],
          // Heavy libraries chunk
          'heavy': ['browser-image-compression', 'heic2any'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (faster and more reliable)
    minify: 'esbuild',
  },
});
