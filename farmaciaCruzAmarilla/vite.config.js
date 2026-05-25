import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cruz Amarilla corre en 5174 para no chocar con MEDISTOCK (5173).
// El proxy /api apunta al backend de MEDISTOCK — esta app es un cliente externo.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
