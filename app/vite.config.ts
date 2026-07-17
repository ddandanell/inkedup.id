import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep large libraries out of the entry chunk. framer-motion stays
        // split because it is used across many routes; recharts is left to
        // Rollup's natural chunking because it is only reached through
        // lazy-loaded admin routes, so it never ends up in the entry chunk.
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'motion';
        },
      },
    },
  },
});
