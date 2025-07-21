import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Polyfill global for fbjs/draft-js
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',    // ← IMPORTANT FIX
  },
  optimizeDeps: {
    include: ['process', 'setimmediate'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
