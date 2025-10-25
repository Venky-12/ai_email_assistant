import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from Docker host (localhost)
    watch: {
      usePolling: true, // enable polling for file changes
      interval: 1000,   // check every 1 second
    },
    port: 5173, // optional, ensures it always runs on same port
  },
})
