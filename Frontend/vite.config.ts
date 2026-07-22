import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy REST API calls to Spring Boot backend
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // Only proxy the OAuth2 *start* flow to the backend
      // /oauth2/authorization/google  →  backend starts the OIDC dance
      '/oauth2/authorization': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // Backend → Google → Google redirects back to backend code-exchange endpoint
      '/login/oauth2': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // NOTE: /oauth2/callback is intentionally NOT proxied —
      // it is a React Router route handled by the frontend SPA.
    },
  },
})

