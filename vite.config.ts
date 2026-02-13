import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/// <reference types="vite/client" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // HTML processing
  html: {
    // Don't inline CSS - let it be handled separately
    cspNonce: undefined,
  },

  // Security optimizations
  build: {
    // Minify and optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Generate source maps for debugging (stored securely)
    sourcemap: true,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },

  // Security headers won't work in dev, but configured in vercel.json for production
  server: {
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
    // Proxy for local API development (Vercel functions)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})