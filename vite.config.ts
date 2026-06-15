import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Everything goes through the API gateway (single entry point). Same-origin
      // via the proxy keeps the JWT cookie first-party (no CORS / SameSite issues).
      // The gateway routes /api/v1/<service>/... to MenuService / AuthService.
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
})
