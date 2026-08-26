import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Express server (server/index.js) serves the built frontend from /dist
// and proxies nothing — the SPA talks to /api/* on the same origin.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    },
  },
});
