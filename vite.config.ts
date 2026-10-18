import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Honor the port injected by the preview harness (falls back to Vite default).
    port: Number(process.env.PORT) || 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    // Route-level lazy chunks can take longer than Vitest's 5-second default
    // on a cold Windows filesystem while Vite transforms the modules.
    testTimeout: 20_000,
  },
})
