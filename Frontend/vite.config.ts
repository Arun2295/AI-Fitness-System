import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Spring Boot backend — avoids CORS issues in dev
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
