import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // MenuService (ShopService) — global prefix /api. Same-origin via proxy = no CORS.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // AuthService — global prefix /api. /auth/session/... -> :3002/api/session/...
      // Proxying keeps the guest JWT cookie first-party (no CORS / SameSite issues).
      '/auth': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/auth/, '/api'),
      },
    },
  },
})
