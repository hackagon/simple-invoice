/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Polling makes HMR reliable over Docker bind mounts (set in dev compose).
    watch:
      process.env.VITE_USE_POLLING === 'true'
        ? { usePolling: true, interval: 300 }
        : undefined,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
